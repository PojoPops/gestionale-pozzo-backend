import { IsString, IsNumber, IsDateString, IsBoolean, IsOptional, Min, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateBollaDto {
  @IsString()
  @IsNotEmpty()
  numeroBolla: string;

  @IsDateString()
  data: string;

  @IsMongoId()
  clienteId: string;

  @IsMongoId()
  pozzoId: string;

  @IsNumber()
  @Min(0)
  ore: number;

  @IsNumber()
  @Min(0)
  metriCubi: number;

  @IsNumber()
  @Min(0)
  acconto: number;

  @IsBoolean()
  @IsOptional()
  saldato?: boolean;

  // NUOVO: campo per indicare se il cliente è socio in questa bolla
  @IsBoolean()
  @IsOptional()
  clienteSocio?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  importoTotale?: number;

  @IsString()
  @IsOptional()
  note?: string;
}