import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClienteDocument = Cliente & Document;

@Schema({ timestamps: true })
export class Cliente {
  @Prop({ required: true })
  nome: string;

  @Prop({ required: true })
  cognome: string;

  @Prop()
  codiceFiscale: string;

  @Prop()
  telefono: string;

  @Prop()
  email: string;

  @Prop()
  indirizzo: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Pozzo' }], default: [] })
  pozziIds: Types.ObjectId[];

  @Prop({ default: true })
  attivo: boolean;

  // AGGIUNTO: campo socio mancante
  @Prop({ default: false })
  socio: boolean;

  @Prop()
  note: string;
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);