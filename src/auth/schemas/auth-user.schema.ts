// Backend: src/auth/schemas/auth-user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthUserDocument = AuthUser & Document;

@Schema({ timestamps: true })
export class AuthUser {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string; // Email utente

  @Prop({ default: true })
  isActive: boolean; // Utente attivo

  @Prop()
  lastLoginAt: Date; // Ultimo accesso

  @Prop({ default: 0 })
  loginCount: number; // Numero totali di accessi

  @Prop()
  notes: string; // Note sull'utente
}

export const AuthUserSchema = SchemaFactory.createForClass(AuthUser);

// Indici
AuthUserSchema.index({ email: 1 });
AuthUserSchema.index({ isActive: 1 });