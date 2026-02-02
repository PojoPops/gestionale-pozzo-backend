// Backend: src/auth/schemas/auth-log.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthLogDocument = AuthLog & Document;

@Schema({ timestamps: true })
export class AuthLog {
  @Prop({ required: true })
  email: string; // Email dell'utente che ha fatto login

  @Prop({ required: true })
  success: boolean; // Login riuscito o fallito

  @Prop()
  ipAddress: string; // IP dell'utente

  @Prop()
  userAgent: string; // Browser/dispositivo

  @Prop()
  passwordUsed: string; // Password utilizzata (per debug)

  @Prop()
  failureReason: string; // Motivo del fallimento (se success = false)
}

export const AuthLogSchema = SchemaFactory.createForClass(AuthLog);

// Indici
AuthLogSchema.index({ email: 1, createdAt: -1 });
AuthLogSchema.index({ success: 1 });
AuthLogSchema.index({ createdAt: -1 });