import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientiController } from './clienti.controller';
import { ClientiService } from './clienti.service';
import { Cliente, ClienteSchema } from './schemas/cliente.schema';
import { Bolla, BollaSchema } from '../bolle/schemas/bolla.schema';
import { Appuntamento, AppuntamentoSchema } from '../appuntamenti/schemas/appuntamento.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cliente.name, schema: ClienteSchema },
      { name: Bolla.name, schema: BollaSchema },
      { name: Appuntamento.name, schema: AppuntamentoSchema },
    ]),
  ],
  controllers: [ClientiController],
  providers: [ClientiService],
  exports: [ClientiService],
})
export class ClientiModule {}