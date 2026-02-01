// Backend: src/appuntamenti/schemas/appuntamento.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppuntamentoDocument = Appuntamento & Document;

@Schema({ timestamps: true })
export class Appuntamento {
  @Prop({ type: Types.ObjectId, ref: 'Cliente', required: true })
  clienteId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Pozzo', required: true })
  pozzoId: Types.ObjectId;

  @Prop({ required: true })
  dataOra: Date;

  @Prop({
    required: true,
    enum: ['Consegna acqua', 'Manutenzione', 'Sopralluogo', 'Altro'],
    default: 'Consegna acqua',
  })
  tipo: string;

  @Prop({
    required: true,
    enum: ['Programmato', 'Completato', 'Annullato'],
    default: 'Programmato',
  })
  stato: string;

  @Prop()
  descrizione: string;

  @Prop()
  note: string;

  @Prop({ default: false })
  notificaReminder: boolean;
}

export const AppuntamentoSchema = SchemaFactory.createForClass(Appuntamento);

// Indice per query ottimizzate
AppuntamentoSchema.index({ dataOra: 1 });
AppuntamentoSchema.index({ clienteId: 1 });
AppuntamentoSchema.index({ pozzoId: 1 });
AppuntamentoSchema.index({ stato: 1 });