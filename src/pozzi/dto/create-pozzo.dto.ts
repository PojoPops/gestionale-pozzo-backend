import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePozzoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  ubicazione?: string;

  @IsBoolean()
  @IsOptional()
  attivo?: boolean;

  @IsString()
  @IsOptional()
  note?: string;

  @IsNumber()
  @IsOptional()
  prezzoSocio?: number;

  @IsNumber()
  @IsOptional()
  prezzoNonSocio?: number;
}