import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BolleModule } from './bolle/bolle.module';
import { PozziModule } from './pozzi/pozzi.module';
import { ClientiModule } from './clienti/clienti.module';
import { AppuntamentiModule } from './appuntamenti/appuntamenti.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        retryAttempts: 3,
        retryDelay: 1000,
        // Opzioni consigliate per produzione
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }),
      inject: [ConfigService],
    }),
    PozziModule,
    ClientiModule,
    BolleModule,
    AppuntamentiModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}