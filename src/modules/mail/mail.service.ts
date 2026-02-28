import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailQueue } from './entities/mail-queue.entity';
import { GetMailQueryDto } from './dto/get-mail-query.dto';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(
    @InjectRepository(MailQueue)
    private mailQueueRepository: Repository<MailQueue>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        await this.transporter.verify();
        this.logger.log('SMTP connection established successfully');
      } else {
        this.logger.warn('SMTP credentials are not fully configured in environment variables');
      }
    } catch (error) {
      this.logger.error('Error connecting to SMTP server:', error);
    }
  }

  async sendMail(to: string, subject: string, text?: string, html?: string) {
    const from = process.env.SMTP_FROM || '"No Reply" <noreply@example.com>';

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw error;
    }
  }

  async enqueue(recipient: string, subject: string, template_id: string, payload: any, priority: number = 0) {
    const queueItem = this.mailQueueRepository.create({
      recipient,
      subject,
      template_id,
      payload,
      priority,
    });
    
    await this.mailQueueRepository.save(queueItem);
    this.logger.log(`[MailService] Enqueued email for ${recipient} with template ${template_id}`);
    return queueItem;
  }

  async getMailStatuses(query: GetMailQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.mailQueueRepository.createQueryBuilder('mail');

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(mail.recipient) LIKE LOWER(:search) OR LOWER(mail.subject) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('mail.status = :status', { status });
    }

    queryBuilder.orderBy('mail.created_at', 'DESC')
                .skip(skip)
                .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
