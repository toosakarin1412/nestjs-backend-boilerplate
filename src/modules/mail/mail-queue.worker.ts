import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { MailQueue, MailQueueStatus } from './entities/mail-queue.entity';
import { Repository } from 'typeorm';
import { MailService } from './mail.service';
import { MailTemplateService } from './mail-template.service';

@Injectable()
export class MailQueueWorker {
  private readonly logger = new Logger(MailQueueWorker.name);
  private isProcessing = false;

  constructor(
    @InjectRepository(MailQueue)
    private readonly mailQueueRepository: Repository<MailQueue>,
    private readonly mailService: MailService,
    private readonly mailTemplateService: MailTemplateService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    if (this.isProcessing) {
      this.logger.debug('Worker is already processing. Skipping cycle.');
      return;
    }
    this.isProcessing = true;

    try {
      await this.processQueue();
    } catch (error) {
      this.logger.error('Error processing mail queue', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processQueue() {
    // We use a transaction to ensure SKIP LOCKED works correctly
    await this.mailQueueRepository.manager.transaction(async (transactionalEntityManager) => {
      // Fetch pending emails that are ready to be sent
      // FOR UPDATE SKIP LOCKED ensures multiple workers don't pick up the same row
      const pendingEmails = await transactionalEntityManager
        .createQueryBuilder(MailQueue, 'mail_queue')
        .where('mail_queue.status = :status', { status: MailQueueStatus.PENDING })
        .andWhere('mail_queue.available_at <= :now', { now: new Date() })
        .orderBy('mail_queue.priority', 'ASC')
        .addOrderBy('mail_queue.created_at', 'ASC')
        .limit(10)
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .getMany();

      if (pendingEmails.length === 0) {
        return;
      }

      this.logger.log(`Found ${pendingEmails.length} pending emails to process.`);

      for (const email of pendingEmails) {
        try {
          email.status = MailQueueStatus.PROCESSING;
          await transactionalEntityManager.save(MailQueue, email);

          // Get the compiled template
          const htmlContent = this.mailTemplateService.getTemplate(email.template_id, email.payload);

          // Send the actual email
          await this.mailService.sendMail(email.recipient, email.subject, undefined, htmlContent);

          // Update status on success
          email.status = MailQueueStatus.SENT;
          await transactionalEntityManager.save(MailQueue, email);
          
          this.logger.log(`Successfully sent email to ${email.recipient} (Queue ID: ${email.id})`);
        } catch (error) {
          this.logger.error(`Failed to send email to ${email.recipient}. Queue ID: ${email.id}. Error: ${error.message}`);
          
          // Increment attempts and schedule retry with exponential backoff
          email.attempts += 1;
          
          if (email.attempts >= 3) {
            email.status = MailQueueStatus.FAILED;
            this.logger.warn(`Mail ID ${email.id} permanently failed after 3 attempts.`);
          } else {
            email.status = MailQueueStatus.PENDING;
            const delayMinutes = Math.pow(2, email.attempts); // 2 mins, then 4 mins...
            email.available_at = new Date(Date.now() + delayMinutes * 60000);
          }
          await transactionalEntityManager.save(MailQueue, email);
        }
      }
    });
  }
}
