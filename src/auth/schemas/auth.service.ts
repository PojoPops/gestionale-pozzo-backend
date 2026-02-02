// Backend: src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthPassword, AuthPasswordDocument } from './auth-password.schema';
import { AuthLog, AuthLogDocument } from './auth-log.schema';
import { AuthUser, AuthUserDocument } from './auth-user.schema';

@Injectable()
export class AuthService {
  // Lista utenti autorizzati (hardcoded per sicurezza)
  private readonly AUTHORIZED_EMAILS = [
    'gianvav65@gmail.com',
    'pozzorutigliano@gmail.com',
  ];

  constructor(
    @InjectModel(AuthPassword.name)
    private authPasswordModel: Model<AuthPasswordDocument>,
    @InjectModel(AuthLog.name)
    private authLogModel: Model<AuthLogDocument>,
    @InjectModel(AuthUser.name)
    private authUserModel: Model<AuthUserDocument>,
  ) {}

  /**
   * Genera una nuova password casuale sicura
   */
  private generateSecurePassword(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 16;
    let password = 'pozzi-';
    
    // Aggiungi mese corrente
    const months = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
    const now = new Date();
    password += `${months[now.getMonth()]}-${now.getFullYear()}-`;
    
    // Aggiungi caratteri casuali
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
  }

  /**
   * Crea una nuova password per il mese
   */
  async generateMonthlyPassword(generatedBy: string = 'auto'): Promise<AuthPassword> {
    const now = new Date();
    
    // Calcola validità: dal 1° del mese corrente al 1° del mese successivo
    const validFrom = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const validUntil = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);

    // Genera password
    const password = this.generateSecurePassword();
    const passwordHash = await bcrypt.hash(password, 10);

    // Disattiva tutte le password precedenti
    await this.authPasswordModel.updateMany(
      { isActive: true },
      { isActive: false },
    );

    // Crea nuova password
    const newPassword = new this.authPasswordModel({
      password,
      passwordHash,
      validFrom,
      validUntil,
      isActive: true,
      emailSent: false,
      generatedBy,
    });

    const saved = await newPassword.save();
    
    console.log(`🔑 Nuova password generata: ${password}`);
    console.log(`📅 Valida da ${validFrom.toISOString()} a ${validUntil.toISOString()}`);
    
    return saved;
  }

  /**
   * Ottiene la password attualmente valida
   */
  async getCurrentPassword(): Promise<AuthPassword | null> {
    const now = new Date();
    
    return this.authPasswordModel
      .findOne({
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gt: now },
      })
      .sort({ validFrom: -1 })
      .exec();
  }

  /**
   * Valida una password inserita dall'utente
   */
  async validatePassword(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    const now = new Date();

    // Verifica che l'email sia autorizzata
    if (!this.AUTHORIZED_EMAILS.includes(email.toLowerCase())) {
      await this.logAccess(email, false, ipAddress, userAgent, password, 'Email non autorizzata');
      return { valid: false, reason: 'Email non autorizzata' };
    }

    // Ottieni password corrente
    const currentPassword = await this.getCurrentPassword();

    if (!currentPassword) {
      await this.logAccess(email, false, ipAddress, userAgent, password, 'Nessuna password attiva');
      return { valid: false, reason: 'Nessuna password configurata' };
    }

    // Verifica scadenza
    if (now > currentPassword.validUntil) {
      await this.logAccess(email, false, ipAddress, userAgent, password, 'Password scaduta');
      return { valid: false, reason: 'Password scaduta' };
    }

    // Verifica password
    const isValid = await bcrypt.compare(password, currentPassword.passwordHash);

    if (!isValid) {
      await this.logAccess(email, false, ipAddress, userAgent, password, 'Password errata');
      return { valid: false, reason: 'Password non valida' };
    }

    // Login riuscito - aggiorna statistiche utente
    await this.updateUserStats(email);
    await this.logAccess(email, true, ipAddress, userAgent, password);

    return { valid: true };
  }

  /**
   * Aggiorna statistiche utente
   */
  private async updateUserStats(email: string): Promise<void> {
    await this.authUserModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: { lastLoginAt: new Date() },
        $inc: { loginCount: 1 },
        $setOnInsert: { isActive: true },
      },
      { upsert: true, new: true },
    );
  }

  /**
   * Logga un tentativo di accesso
   */
  private async logAccess(
    email: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    passwordUsed?: string,
    failureReason?: string,
  ): Promise<void> {
    const log = new this.authLogModel({
      email: email.toLowerCase(),
      success,
      ipAddress,
      userAgent,
      passwordUsed,
      failureReason,
    });

    await log.save();
  }

  /**
   * Ottiene statistiche accessi
   */
  async getStats(): Promise<{
    totalLogins: number;
    successfulLogins: number;
    failedLogins: number;
    todayLogins: number;
    weekLogins: number;
    monthLogins: number;
    uniqueUsers: number;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalLogins,
      successfulLogins,
      failedLogins,
      todayLogins,
      weekLogins,
      monthLogins,
      uniqueUsers,
    ] = await Promise.all([
      this.authLogModel.countDocuments(),
      this.authLogModel.countDocuments({ success: true }),
      this.authLogModel.countDocuments({ success: false }),
      this.authLogModel.countDocuments({ createdAt: { $gte: todayStart } }),
      this.authLogModel.countDocuments({ createdAt: { $gte: weekStart } }),
      this.authLogModel.countDocuments({ createdAt: { $gte: monthStart } }),
      this.authUserModel.countDocuments({ isActive: true }),
    ]);

    return {
      totalLogins,
      successfulLogins,
      failedLogins,
      todayLogins,
      weekLogins,
      monthLogins,
      uniqueUsers,
    };
  }

  /**
   * Ottiene log recenti
   */
  async getRecentLogs(limit: number = 50): Promise<AuthLog[]> {
    return this.authLogModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Ottiene lista utenti autorizzati
   */
  async getAuthorizedUsers(): Promise<AuthUser[]> {
    return this.authUserModel
      .find()
      .sort({ lastLoginAt: -1 })
      .exec();
  }

  /**
   * Marca la password come email inviata
   */
  async markEmailSent(passwordId: string): Promise<void> {
    await this.authPasswordModel.findByIdAndUpdate(passwordId, {
      emailSent: true,
      emailSentAt: new Date(),
    });
  }

  /**
   * Inizializza gli utenti autorizzati nel database
   */
  async initializeAuthorizedUsers(): Promise<void> {
    for (const email of this.AUTHORIZED_EMAILS) {
      await this.authUserModel.findOneAndUpdate(
        { email },
        { $setOnInsert: { isActive: true, loginCount: 0 } },
        { upsert: true },
      );
    }
    console.log('✅ Utenti autorizzati inizializzati');
  }
}