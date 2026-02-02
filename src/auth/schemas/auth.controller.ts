// Backend: src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Ip,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('validate')
  async validatePassword(
    @Body() body: { email: string; password: string },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.validatePassword(
      body.email,
      body.password,
      ip,
      userAgent,
    );

    if (!result.valid) {
      throw new UnauthorizedException(result.reason || 'Password non valida');
    }

    const currentPassword = await this.authService.getCurrentPassword();

    return {
      success: true,
      expiresAt: currentPassword?.validUntil,
    };
  }

  @Get('current-password')
  async getCurrentPassword() {
    const password = await this.authService.getCurrentPassword();

    if (!password) {
      return { exists: false };
    }

    return {
      exists: true,
      validFrom: password.validFrom,
      validUntil: password.validUntil,
      emailSent: password.emailSent,
      generatedBy: password.generatedBy,
    };
  }

  @Get('stats')
  async getStats() {
    return this.authService.getStats();
  }

  @Get('logs')
  async getLogs() {
    return this.authService.getRecentLogs(50);
  }

  @Get('users')
  async getUsers() {
    return this.authService.getAuthorizedUsers();
  }
}