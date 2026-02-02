// Backend: src/bolle/bolle.controller.ts

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
  Query,
  Res,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';
import { BolleService } from './bolle.service';
import { CreateBollaDto } from './dto/create-bolla.dto';
import { UpdateBollaDto } from './dto/update-bolla.dto';
import { ExportPdfDto } from './dto/export-pdf.dto';

@Controller('api/bolle')
export class BolleController {
  constructor(private readonly bolleService: BolleService) {}

  @Post()
  create(@Body() createBollaDto: CreateBollaDto) {
    return this.bolleService.create(createBollaDto);
  }

  @Get()
  findAll(
    @Query('clienteId') clienteId?: string,
    @Query('pozzoId') pozzoId?: string,
  ) {
    if (clienteId && pozzoId) {
      return this.bolleService.findByClienteAndPozzo(clienteId, pozzoId);
    }
    if (clienteId) {
      return this.bolleService.findByCliente(clienteId);
    }
    if (pozzoId) {
      return this.bolleService.findByPozzo(pozzoId);
    }
    return this.bolleService.findAll();
  }

  @Get('next-numero/:pozzoId')
  getNextNumeroBolla(@Param('pozzoId') pozzoId: string) {
    return this.bolleService.getNextNumeroBolla(pozzoId);
  }

  @Post('export-pdf')
  async exportPdf(
    @Body() exportPdfDto: ExportPdfDto, 
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Log temporaneo per debug
      console.log('📥 Ricevuta richiesta export PDF');
      console.log('📊 Numero bolle:', exportPdfDto.bolle?.length || 0);
      console.log('🔍 Filtri:', exportPdfDto.filtri?.length || 0);
      console.log('📈 Stats:', exportPdfDto.stats ? 'presenti' : 'assenti');

      const pdfBuffer = await this.bolleService.exportPdf(exportPdfDto);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="bolle_${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
      console.log('✅ PDF inviato con successo');
    } catch (error) {
      console.error('❌ Errore export PDF:', error);
      throw new HttpException(
        {
          statusCode: 400,
          message: 'Errore durante la generazione del PDF',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bolleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBollaDto: UpdateBollaDto) {
    return this.bolleService.update(id, updateBollaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.bolleService.remove(id);
  }
}