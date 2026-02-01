import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PozziController } from './pozzi.controller';
import { PozziService } from './pozzi.service';
import { Pozzo, PozzoSchema } from './schemas/pozzo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pozzo.name, schema: PozzoSchema }]),
  ],
  controllers: [PozziController],
  providers: [PozziService],
  exports: [PozziService],
})
export class PozziModule {}