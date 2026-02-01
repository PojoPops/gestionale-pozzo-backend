import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BolleController } from './bolle.controller';
import { BolleService } from './bolle.service';
import { Bolla, BollaSchema } from './schemas/bolla.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bolla.name, schema: BollaSchema }]),
  ],
  controllers: [BolleController],
  providers: [BolleService],
})
export class BolleModule {}