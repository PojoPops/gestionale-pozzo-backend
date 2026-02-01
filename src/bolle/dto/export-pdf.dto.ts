import { IsArray, IsObject, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class BollaExportDto {
  @IsString()
  numeroBolla: string;

  @IsString()
  data: string;

  @IsString()
  cliente: string;

  @IsString()
  pozzo: string;

  @IsString()
  metriCubi: string;

  @IsString()
  ore: string;

  @IsString()
  acconto: string;

  @IsString()
  importoTotale: string;

  @IsString()
  saldato: string;

  @IsString()
  @IsOptional()
  note?: string;
}

class StatsDto {
  totaleBolle: number;
  totaleFatturato: string;
  totaleAcconti: string;
  totaleMetriCubi: string;
  totaleOre: string;
}

export class ExportPdfDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BollaExportDto)
  bolle: BollaExportDto[];

  @IsArray()
  @IsString({ each: true })
  filtri: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => StatsDto)
  stats: StatsDto;
}