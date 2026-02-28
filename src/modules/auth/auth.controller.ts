import { Request, Controller, Logger, Post, Get, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';
import { RefreshJwtGuard } from './guard/jwt-refresh.guard';
import { JwtGuard } from './guard/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private passwordResetService: PasswordResetService,
  ) { }

  private readonly logger = new Logger(AuthController.name);

  @Post('password-reset-request')
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiResponse({ status: 201, description: 'Reset email queued' })
  async requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    await this.passwordResetService.requestReset(dto.email);
    return { success: true, message: 'A password reset link has been sent to your email address.' };
  }

  @Post('password-reset-confirm')
  @ApiOperation({ summary: 'Confirm password reset using token' })
  @ApiResponse({ status: 201, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async confirmPasswordReset(@Body() dto: PasswordResetConfirmDto) {
    await this.passwordResetService.verifyAndReset(dto.token, dto.newPassword);
    return { success: true, message: 'Password has been successfully reset.' };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Return JWT tokens' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    return await this.authService.login(req.user);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Return new JWT tokens' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refresh(@Request() req) {
    return await this.authService.refreshToken(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify access token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  verifyToken(@Request() req) {
    // If the JwtGuard passes, the token is valid.
    // We return the decoded user payload to the frontend.
    return { valid: true };
  }
}
