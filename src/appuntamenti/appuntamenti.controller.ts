// Backend: src/appuntamenti/appuntamenti.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AppuntamentiService } from './appuntamenti.service';
import { CreateAppuntamentoDto } from './dto/create-appuntamento.dto';
import { UpdateAppuntamentoDto } from './dto/update-appuntamento.dto';

@Controller('api/appuntamenti')
export class AppuntamentiController {
  constructor(private readonly appuntamentiService: AppuntamentiService) {}

  @Post()
  create(@Body() createAppuntamentoDto: CreateAppuntamentoDto) {
    return this.appuntamentiService.create(createAppuntamentoDto);
  }

  @Get()
  findAll(
    @Query('clienteId') clienteId?: string,
    @Query('pozzoId') pozzoId?: string,
    @Query('stato') stato?: string,
    @Query('dataInizio') dataInizio?: string,
    @Query('dataFine') dataFine?: string,
  ) {
    return this.appuntamentiService.findAll({
      clienteId,
      pozzoId,
      stato,
      dataInizio,
      dataFine,
    });
  }

  @Get('stats')
  getStats() {
    return this.appuntamentiService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appuntamentiService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppuntamentoDto: UpdateAppuntamentoDto,
  ) {
    return this.appuntamentiService.update(id, updateAppuntamentoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.appuntamentiService.remove(id);
    return { message: 'Appuntamento eliminato con successo' };
  }
}