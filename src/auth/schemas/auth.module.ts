// Backend: src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthPassword, AuthPasswordSchema } from './auth-password.schema';
import { AuthLog, AuthLogSchema } from './auth-log.schema';
import { AuthUser, AuthUserSchema } from './auth-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuthPassword.name, schema: AuthPasswordSchema },
      { name: AuthLog.name, schema: AuthLogSchema },
      { name: AuthUser.name, schema: AuthUserSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}