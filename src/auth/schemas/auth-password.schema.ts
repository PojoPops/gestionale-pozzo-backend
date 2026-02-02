// Backend: src/auth/schemas/auth-password.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthPasswordDocument = AuthPassword & Document;

@Schema({ timestamps: true })
export class AuthPassword {
  @Prop({ required: true })
  password: string; // Password in chiaro (verrà hashata)

  @Prop({ required: true })
  passwordHash: string; // Hash bcrypt della password

  @Prop({ required: true })
  validFrom: Date; // Data inizio validità

  @Prop({ required: true })
  validUntil: Date; // Data fine validità

  @Prop({ default: true })
  isActive: boolean; // Password attualmente attiva

  @Prop({ default: false })
  emailSent: boolean; // Email inviata agli utenti

  @Prop()
  emailSentAt: Date; // Quando è stata inviata l'email

  @Prop({ default: 'auto' })
  generatedBy: string; // 'auto' | 'manual' | 'admin'
}

export const AuthPasswordSchema = SchemaFactory.createForClass(AuthPassword);

// Indici
AuthPasswordSchema.index({ validFrom: 1, validUntil: 1 });
AuthPasswordSchema.index({ isActive: 1 });