import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/schemas/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  console.log('🚀 Inizializzazione sistema autenticazione...');

  // Inizializza utenti autorizzati
  await authService.initializeAuthorizedUsers();

  // Genera prima password
  const password = await authService.generateMonthlyPassword('manual');
  console.log('✅ Prima password generata!');
  console.log('🔑 Password:', password.password);
  console.log('📅 Valida da:', password.validFrom);
  console.log('📅 Valida fino a:', password.validUntil);

  await app.close();
}

bootstrap();