import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMailDto {
  @ApiProperty({ description: 'Recipient email address', example: 'test@example.com' })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ description: 'Email subject', example: 'Test Email' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Email body text', example: 'Hello, this is a test email!', required: false })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ description: 'Email body HTML', example: '<b>Hello, this is a test email!</b>', required: false })
  @IsString()
  @IsOptional()
  html?: string;
}
