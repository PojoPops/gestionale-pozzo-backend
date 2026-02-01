import { PartialType } from '@nestjs/mapped-types';
import { CreatePozzoDto } from './create-pozzo.dto';

export class UpdatePozzoDto extends PartialType(CreatePozzoDto) {}