import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  providers: [MailService],
  controllers: [],
  exports: [MailService],
})
export class MailModule {}
