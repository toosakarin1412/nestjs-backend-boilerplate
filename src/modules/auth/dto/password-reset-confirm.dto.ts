import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PasswordResetConfirmDto {
  @ApiProperty({ example: 'a1b2c3d4...', description: 'The raw token from the email' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'newSecurePassword123!', description: 'The new password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
