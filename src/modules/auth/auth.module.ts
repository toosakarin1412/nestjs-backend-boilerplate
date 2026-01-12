import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local-strategy';
import { JwtStrategy } from './strategies/jwt-strategy';
import { RefreshJwtStrategy } from './strategies/refreshToken-strategy';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecretKey',
      signOptions: { expiresIn: '18000s' },
    }),
  ],
})
export class AuthModule { }
