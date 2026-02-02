// Backend: src/admin/admin.controller.ts

import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('generate-password')
  async generatePassword() {
    return this.adminService.generateAndSendPassword();
  }

  @Post('send-password-email')
  async sendPasswordEmail() {
    return this.adminService.sendCurrentPasswordEmail();
  }
}