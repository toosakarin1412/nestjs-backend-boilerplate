import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordReset } from './entities/password-reset.entity';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService, // Make sure MailModule is exported and imported
  ) {}

  /**
   * Generates a secure random token, hashes it, stores it, and emails the raw token.
   */
  async requestReset(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      // Security best practice: Don't reveal if account exists. Just return successfully.
      return;
    }

    // 1. Generate 32-byte secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash token (SHA-256) for DB storage
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 3. Create expiration date (60 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 60);

    // 4. Save to database
    const resetRecord = this.passwordResetRepository.create({
      email,
      tokenHash,
      expiresAt,
    });
    await this.passwordResetRepository.save(resetRecord);

    const frontendUrl = process.env.FRONTEND_LINK || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

    // 5. Enqueue email with the raw token
    // Using the queue system built earlier
    await this.mailService.enqueue(
      email,
      'Password Reset Request',
      'reset-password',
      { code: rawToken, link: resetLink },
      1 // High priority
    );

    this.logger.log(`Password reset email queued for ${email}`);
  }

  /**
   * Verifies the token hash, ensures it's unexpired and unused, and resets the user's password.
   */
  async verifyAndReset(rawToken: string, newPassword: string): Promise<void> {
    // 1. Hash the incoming raw token
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 2. Find matching record
    const resetRecord = await this.passwordResetRepository.findOne({
      where: { tokenHash: hash },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    // 3. Verify it hasn't been used and hasn't expired
    if (resetRecord.usedAt) {
      throw new BadRequestException('Password reset token has already been used');
    }

    if (new Date() > resetRecord.expiresAt) {
      throw new BadRequestException('Password reset token has expired');
    }

    // 4. Find the user associated with this token's email
    const user = await this.usersService.findByEmail(resetRecord.email);
    if (!user) {
      throw new NotFoundException('User associated with this token not found');
    }

    // 5. Hash new password and update the user via UsersService
    const newPasswordHash = await argon2.hash(newPassword);
    
    await this.usersService.update(user.user_uuid, { password: newPasswordHash } as any);

    // 6. Mark token as used
    resetRecord.usedAt = new Date();
    await this.passwordResetRepository.save(resetRecord);

    this.logger.log(`Password successfully reset for user ${user.email}`);
  }
}
