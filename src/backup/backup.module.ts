import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';
import { Pozzo, PozzoSchema } from '../pozzi/schemas/pozzo.schema';
import { Cliente, ClienteSchema } from '../clienti/schemas/cliente.schema';
import { Bolla, BollaSchema } from '../bolle/schemas/bolla.schema';

// Se hai il modulo Appuntamenti, decommentalo:
// import { Appuntamento, AppuntamentoSchema } from '../appuntamenti/schemas/appuntamento.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pozzo.name, schema: PozzoSchema },
      { name: Cliente.name, schema: ClienteSchema },
      { name: Bolla.name, schema: BollaSchema },
      // Se hai il modulo Appuntamenti, aggiungi anche:
      // { name: Appuntamento.name, schema: AppuntamentoSchema },
    ]),
  ],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupModule {}