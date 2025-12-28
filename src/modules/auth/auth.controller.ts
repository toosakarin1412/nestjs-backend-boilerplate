import { Request, Controller, Logger, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshJwtGuard } from './guard/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  private readonly logger = new Logger(AuthController.name);

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    return await this.authService.login(req.user);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    return await this.authService.refreshToken(req.user);
  }
}
