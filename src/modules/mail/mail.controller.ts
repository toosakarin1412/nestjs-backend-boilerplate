import { Controller, Post, Get, Query, Body, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { GetMailQueryDto } from './dto/get-mail-query.dto';
import { JwtGuard } from '../auth/guard/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';

@ApiTags('Mail')
@ApiBearerAuth()
@Controller('mail')
@UseGuards(JwtGuard, PermissionsGuard)
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

  @Get('status')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get paginated list of email statuses' })
  @ApiResponse({ status: 200, description: 'Return email statuses' })
  @Permissions('mail.read')
  async getMailStatuses(@Query() query: GetMailQueryDto) {
    return this.mailService.getMailStatuses(query);
  }
}
