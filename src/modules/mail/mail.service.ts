import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
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
}
