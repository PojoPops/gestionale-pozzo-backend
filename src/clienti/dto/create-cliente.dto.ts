import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsArray, IsEmail } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  cognome: string;

  @IsString()
  @IsOptional()
  codiceFiscale?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  indirizzo?: string;

  @IsArray()
  @IsOptional()
  pozziIds?: string[];

  @IsBoolean()
  @IsOptional()
  attivo?: boolean;

  // AGGIUNTO: campo socio mancante
  @IsBoolean()
  @IsOptional()
  socio?: boolean;

  @IsString()
  @IsOptional()
  note?: string;
}