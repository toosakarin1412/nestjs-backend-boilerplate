import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailQueue } from './entities/mail-queue.entity';
import { MailTemplateService } from './mail-template.service';
import { MailQueueWorker } from './mail-queue.worker';

@Module({
  imports: [TypeOrmModule.forFeature([MailQueue])],
  providers: [MailService, MailTemplateService, MailQueueWorker],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
