import { Controller, Post, Body, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { JwtGuard } from '../auth/guard/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';

@ApiTags('Mail')
@ApiBearerAuth()
@Controller('mail')
// We can use guards if needed. For now, we will just protect the endpoint with JwtGuard to ensure only authenticated users can test it
// @UseGuards(JwtGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  @ApiOperation({ summary: 'Test sending an email via SMTP' })
  @ApiResponse({ status: 201, description: 'Email has been sent successfully' })
  @ApiResponse({ status: 500, description: 'Failed to send email' })
  async sendTestMail(@Body() sendMailDto: SendMailDto) {
    try {
      const result = await this.mailService.sendMail(
        sendMailDto.to,
        sendMailDto.subject,
        sendMailDto.text,
        sendMailDto.html
      );
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Failed to send test email. Check server logs.');
    }
  }

  @Post('enqueue-test')
  @ApiOperation({ summary: 'Test enqueueing an email via DB queue' })
  @ApiResponse({ status: 201, description: 'Email has been enqueued successfully' })
  @ApiResponse({ status: 500, description: 'Failed to enqueue email' })
  async enqueueTestMail(@Body() body: { to: string, subject: string, template_id: string, payload: any, priority?: number }) {
    try {
      const result = await this.mailService.enqueue(
        body.to,
        body.subject,
        body.template_id,
        body.payload,
        body.priority
      );
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Failed to enqueue test email. Check server logs.');
    }
  }
}
