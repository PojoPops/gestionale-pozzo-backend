import { PartialType } from '@nestjs/mapped-types';
import { CreateBollaDto } from './create-bolla.dto';

export class UpdateBollaDto extends PartialType(CreateBollaDto) {}