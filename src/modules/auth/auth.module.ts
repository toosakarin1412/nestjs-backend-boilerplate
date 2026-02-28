import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { LocalStrategy } from './strategies/local-strategy';
import { JwtStrategy } from './strategies/jwt-strategy';
import { RefreshJwtStrategy } from './strategies/refreshToken-strategy';
import { PasswordReset } from './entities/password-reset.entity';

@Module({
  providers: [AuthService, PasswordResetService, LocalStrategy, JwtStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([PasswordReset]),
    UsersModule,
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecretKey',
      signOptions: { expiresIn: '18000s' },
    }),
  ],
})
export class AuthModule { }
