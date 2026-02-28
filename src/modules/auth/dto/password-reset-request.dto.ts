import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class PasswordResetRequestDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email for password reset' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
