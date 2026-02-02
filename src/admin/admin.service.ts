// Backend: src/admin/admin.service.ts

import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/schemas/auth.service';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class AdminService {
  private readonly RECIPIENT_EMAILS = [
    'gianvav65@gmail.com',
    'pozzorutigliano@gmail.com',
  ];

  constructor(private readonly authService: AuthService) {
    // Inizializza SendGrid
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      console.log('✅ SendGrid inizializzato');
    } else {
      console.warn('⚠️  SENDGRID_API_KEY non configurata - email disabilitate');
    }
  }

  /**
   * Genera una nuova password e invia email agli utenti
   */
  async generateAndSendPassword(): Promise<{
    success: boolean;
    password: string;
    emailSent: boolean;
    errors?: string[];
  }> {
    // Genera nuova password
    const newPassword = await this.authService.generateMonthlyPassword('manual');

    // Invia email
    const emailResult = await this.sendPasswordEmail(
      newPassword.password,
      newPassword.validFrom,
      newPassword.validUntil,
    );

    // Marca come inviata se email riuscite
    if (emailResult.success) {
      await this.authService.markEmailSent((newPassword as any)._id.toString());
    }

    return {
      success: true,
      password: newPassword.password,
      emailSent: emailResult.success,
      errors: emailResult.errors,
    };
  }

  /**
   * Invia email con la password corrente
   */
  async sendCurrentPasswordEmail(): Promise<{
    success: boolean;
    errors?: string[];
  }> {
    const currentPassword = await this.authService.getCurrentPassword();

    if (!currentPassword) {
      return {
        success: false,
        errors: ['Nessuna password attiva'],
      };
    }

    return this.sendPasswordEmail(
      currentPassword.password,
      currentPassword.validFrom,
      currentPassword.validUntil,
    );
  }

  /**
   * Invia email con SendGrid
   */
  private async sendPasswordEmail(
    password: string,
    validFrom: Date,
    validUntil: Date,
  ): Promise<{
    success: boolean;
    errors?: string[];
  }> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('⚠️  SendGrid non configurato - email non inviate');
      return {
        success: false,
        errors: ['SendGrid non configurato'],
      };
    }

    const errors: string[] = [];

    // Template email HTML
    const htmlContent = this.getEmailTemplate(password, validFrom, validUntil);
    const textContent = `
Gestionale Pozzi - Nuova Password

Ciao,

È stata generata una nuova password per accedere al Gestionale Pozzi.

Password: ${password}

Valida da: ${validFrom.toLocaleDateString('it-IT')}
Valida fino a: ${validUntil.toLocaleDateString('it-IT')}

Accedi su: ${process.env.FRONTEND_URL || 'https://tua-app.vercel.app'}

Questa password cambierà automaticamente il primo giorno del mese successivo.

---
Gestionale Pozzi
    `.trim();

    // Invia a ogni destinatario
    for (const email of this.RECIPIENT_EMAILS) {
      try {
        await sgMail.send({
          to: email,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@gestionale-pozzi.com',
          subject: `🔑 Nuova Password Gestionale Pozzi - ${new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}`,
          text: textContent,
          html: htmlContent,
        });
        console.log(`✅ Email inviata a ${email}`);
      } catch (error) {
        console.error(`❌ Errore invio email a ${email}:`, error);
        errors.push(`Errore invio a ${email}`);
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Template HTML per l'email
   */
  private getEmailTemplate(
    password: string,
    validFrom: Date,
    validUntil: Date,
  ): string {
    const frontendUrl = process.env.FRONTEND_URL || 'https://tua-app.vercel.app';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuova Password Gestionale Pozzi</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <div style="background-color: #ffffff; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">💧</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Gestionale Pozzi</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0; font-size: 16px;">Sistema di Gestione</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">🔑 Nuova Password Mensile</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Ciao,<br><br>
                È stata generata automaticamente una nuova password per accedere al Gestionale Pozzi.
              </p>

              <!-- Password Box -->
              <div style="background-color: #f9fafb; border: 2px solid #2563eb; border-radius: 8px; padding: 24px; margin: 30px 0; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px; font-weight: 600;">LA TUA PASSWORD</p>
                <p style="color: #1f2937; font-size: 24px; font-weight: bold; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 2px;">
                  ${password}
                </p>
              </div>

              <!-- Validity Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="width: 50%; padding-right: 10px;">
                    <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px;">
                      <p style="color: #065f46; font-size: 12px; margin: 0 0 4px; font-weight: 600;">📅 VALIDA DA</p>
                      <p style="color: #047857; font-size: 16px; margin: 0; font-weight: bold;">${validFrom.toLocaleDateString('it-IT')}</p>
                    </div>
                  </td>
                  <td style="width: 50%; padding-left: 10px;">
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px;">
                      <p style="color: #92400e; font-size: 12px; margin: 0 0 4px; font-weight: 600;">⏰ SCADE IL</p>
                      <p style="color: #b45309; font-size: 16px; margin: 0; font-weight: bold;">${validUntil.toLocaleDateString('it-IT')}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${frontendUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                  Accedi al Gestionale
                </a>
              </div>

              <!-- Info Box -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 30px 0;">
                <p style="color: #1e40af; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>ℹ️ Nota:</strong> Questa password cambierà automaticamente il primo giorno del mese successivo. Riceverai una nuova email con la password aggiornata.
                </p>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                Se hai domande o problemi, contatta l'amministratore del sistema.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px;">
                <strong>Gestionale Pozzi</strong>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} - Sistema di Gestione Automatica
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0;">
                Questa è un'email automatica, non rispondere.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}