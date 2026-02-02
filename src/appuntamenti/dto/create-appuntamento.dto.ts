// Backend: src/appuntamenti/dto/create-appuntamento.dto.ts

import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsMongoId,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAppuntamentoDto {
  @IsNotEmpty({ message: 'Il cliente è obbligatorio' })
  @IsMongoId({ message: 'ID cliente non valido' })
  clienteId: string;

  @IsNotEmpty({ message: 'Il pozzo è obbligatorio' })
  @IsMongoId({ message: 'ID pozzo non valido' })
  pozzoId: string;

  @IsNotEmpty({ message: 'La data e ora sono obbligatorie' })
  @IsDateString({}, { message: 'Formato data non valido' })
  @Transform(({ value }) => {
    // Assicura che la data sia in formato ISO string
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  })
  dataOra: string | Date;

  @IsNotEmpty({ message: 'Il tipo di appuntamento è obbligatorio' })
  @IsEnum(['Consegna acqua', 'Manutenzione', 'Sopralluogo', 'Altro'], {
    message: 'Tipo di appuntamento non valido',
  })
  tipo: 'Consegna acqua' | 'Manutenzione' | 'Sopralluogo' | 'Altro';

  @IsOptional()
  @IsEnum(['Programmato', 'Completato', 'Annullato'], {
    message: 'Stato non valido',
  })
  stato?: 'Programmato' | 'Completato' | 'Annullato';

  @IsOptional()
  @IsString({ message: 'La descrizione deve essere una stringa' })
  descrizione?: string;

  @IsOptional()
  @IsString({ message: 'Le note devono essere una stringa' })
  note?: string;

  @IsOptional()
  @IsBoolean({ message: 'notificaReminder deve essere un booleano' })
  notificaReminder?: boolean;
}