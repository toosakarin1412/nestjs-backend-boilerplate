/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) { }
  private readonly logger = new Logger(AuthService.name);

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await argon2.verify(user.password, pass))) {
      const { password, salt, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      sub: user.user_uuid,
      email: user.email,
      role: user.role,
    };

    return {
      user_id: user.user_uuid,
      access_token: this.jwtService.sign(payload, {
        expiresIn: '2h',
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async refreshToken(user: any) {
    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };

    return {
      user_id: user.userId,
      access_token: this.jwtService.sign(payload, {
        expiresIn: '2h',
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }
}
