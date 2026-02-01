import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ClientiService } from './clienti.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('api/clienti')
export class ClientiController {
  constructor(private readonly clientiService: ClientiService) {}

  @Post()
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientiService.create(createClienteDto);
  }

  @Get()
  findAll() {
    return this.clientiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientiService.findOne(id);
  }

  @Get('pozzo/:pozzoId')
  findByPozzo(@Param('pozzoId') pozzoId: string) {
    return this.clientiService.findByPozzo(pozzoId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientiService.update(id, updateClienteDto);
  }

  @Delete(':id')
  // RIMOSSO @HttpCode(HttpStatus.NO_CONTENT) per permettere risposte con errori
  async remove(@Param('id') id: string) {
    try {
      console.log('🎯 Controller: Ricevuta richiesta DELETE per cliente:', id);
      await this.clientiService.remove(id);
      console.log('✅ Controller: Cliente eliminato con successo');
      
      // Restituisci un oggetto vuoto invece di undefined per 200 OK
      return { message: 'Cliente eliminato con successo' };
    } catch (error) {
      console.error('❌ Controller: Errore durante eliminazione:', error);
      
      // Se è un'eccezione NestJS, rilancia così com'è
      if (error instanceof HttpException) {
        console.log('🔄 Controller: Rilancio HttpException con status:', error.getStatus());
        throw error;
      }
      
      // Se è un NotFoundException
      if (error instanceof NotFoundException) {
        console.log('🔄 Controller: Rilancio NotFoundException');
        throw error;
      }
      
      // Se è un BadRequestException
      if (error instanceof BadRequestException) {
        console.log('🔄 Controller: Rilancio BadRequestException');
        throw error;
      }
      
      // Altrimenti, lancia un errore generico
      console.log('🔄 Controller: Errore sconosciuto, creo InternalServerError');
      throw new HttpException(
        'Errore interno del server durante l\'eliminazione del cliente',
        500,
      );
    }
  }
}