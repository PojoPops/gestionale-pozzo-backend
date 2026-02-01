// Backend: src/appuntamenti/dto/create-appuntamento.dto.ts

export class CreateAppuntamentoDto {
  clienteId: string;
  pozzoId: string;
  dataOra: Date;
  tipo: 'Consegna acqua' | 'Manutenzione' | 'Sopralluogo' | 'Altro';
  stato?: 'Programmato' | 'Completato' | 'Annullato';
  descrizione?: string;
  note?: string;
  notificaReminder?: boolean;
}