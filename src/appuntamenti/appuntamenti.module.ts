// Backend: src/appuntamenti/appuntamenti.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppuntamentiController } from './appuntamenti.controller';
import { AppuntamentiService } from './appuntamenti.service';
import { Appuntamento, AppuntamentoSchema } from './schemas/appuntamento.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appuntamento.name, schema: AppuntamentoSchema },
    ]),
  ],
  controllers: [AppuntamentiController],
  providers: [AppuntamentiService],
  exports: [AppuntamentiService],
})
export class AppuntamentiModule {}