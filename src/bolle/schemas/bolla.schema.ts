import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BollaDocument = Bolla & Document;

@Schema({ timestamps: true })
export class Bolla {
  // MODIFICATO: numeroBolla NON è più unique globalmente
  // La validazione dell'unicità per pozzo sarà gestita nel service
  @Prop({ required: true })
  numeroBolla: string;

  @Prop({ required: true })
  data: Date;

  @Prop({ type: Types.ObjectId, ref: 'Cliente', required: true })
  clienteId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Pozzo', required: true })
  pozzoId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  ore: number;

  @Prop({ required: true, min: 0 })
  metriCubi: number;

  @Prop({ required: true, min: 0 })
  acconto: number;

  @Prop({ default: false })
  saldato: boolean;

  // NUOVO: campo per indicare se il cliente è considerato socio in questa specifica bolla
  @Prop({ default: false })
  clienteSocio: boolean;

  @Prop({ min: 0 })
  importoTotale: number;

  @Prop()
  note: string;
}

export const BollaSchema = SchemaFactory.createForClass(Bolla);

// NUOVO: Indice composto per garantire unicità del numero bolla per pozzo
BollaSchema.index({ pozzoId: 1, numeroBolla: 1 }, { unique: true });