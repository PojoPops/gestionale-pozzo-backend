import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PozziService } from './pozzi.service';
import { CreatePozzoDto } from './dto/create-pozzo.dto';
import { UpdatePozzoDto } from './dto/update-pozzo.dto';

@Controller('api/pozzi')
export class PozziController {
  constructor(private readonly pozziService: PozziService) {}

  @Post()
  create(@Body() createPozzoDto: CreatePozzoDto) {
    return this.pozziService.create(createPozzoDto);
  }

  @Get()
  findAll() {
    return this.pozziService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pozziService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePozzoDto: UpdatePozzoDto) {
    return this.pozziService.update(id, updatePozzoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.pozziService.remove(id);
  }
}