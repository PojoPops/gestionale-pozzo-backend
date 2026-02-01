import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PozzoDocument = Pozzo & Document;

@Schema({ timestamps: true })
export class Pozzo {
  @Prop({ required: true })
  nome: string;

  @Prop()
  ubicazione: string;

  @Prop({ default: true })
  attivo: boolean;

  @Prop()
  note: string;

  @Prop({ type: Number })
  prezzoSocio: number;

  @Prop({ type: Number })
  prezzoNonSocio: number;
}

export const PozzoSchema = SchemaFactory.createForClass(Pozzo);