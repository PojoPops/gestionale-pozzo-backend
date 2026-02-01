// Backend: src/appuntamenti/appuntamenti.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appuntamento, AppuntamentoDocument } from './schemas/appuntamento.schema';
import { CreateAppuntamentoDto } from './dto/create-appuntamento.dto';
import { UpdateAppuntamentoDto } from './dto/update-appuntamento.dto';

@Injectable()
export class AppuntamentiService {
  constructor(
    @InjectModel(Appuntamento.name)
    private appuntamentoModel: Model<AppuntamentoDocument>,
  ) {}

  async create(createAppuntamentoDto: CreateAppuntamentoDto): Promise<Appuntamento> {
    const appuntamento = new this.appuntamentoModel({
      ...createAppuntamentoDto,
      clienteId: new Types.ObjectId(createAppuntamentoDto.clienteId),
      pozzoId: new Types.ObjectId(createAppuntamentoDto.pozzoId),
    });
    return appuntamento.save();
  }

  async findAll(filters?: {
    clienteId?: string;
    pozzoId?: string;
    stato?: string;
    dataInizio?: string;
    dataFine?: string;
  }): Promise<Appuntamento[]> {
    const query: any = {};

    if (filters?.clienteId) {
      query.clienteId = new Types.ObjectId(filters.clienteId);
    }

    if (filters?.pozzoId) {
      query.pozzoId = new Types.ObjectId(filters.pozzoId);
    }

    if (filters?.stato) {
      query.stato = filters.stato;
    }

    if (filters?.dataInizio || filters?.dataFine) {
      query.dataOra = {};
      if (filters.dataInizio) {
        query.dataOra.$gte = new Date(filters.dataInizio);
      }
      if (filters.dataFine) {
        query.dataOra.$lte = new Date(filters.dataFine);
      }
    }

    return this.appuntamentoModel
      .find(query)
      .populate('clienteId')
      .populate('pozzoId')
      .sort({ dataOra: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Appuntamento> {
    const appuntamento = await this.appuntamentoModel
      .findById(id)
      .populate('clienteId')
      .populate('pozzoId')
      .exec();

    if (!appuntamento) {
      throw new NotFoundException(`Appuntamento con ID ${id} non trovato`);
    }

    return appuntamento;
  }

  async update(
    id: string,
    updateAppuntamentoDto: UpdateAppuntamentoDto,
  ): Promise<Appuntamento> {
    const updateData: any = { ...updateAppuntamentoDto };

    if (updateAppuntamentoDto.clienteId) {
      updateData.clienteId = new Types.ObjectId(updateAppuntamentoDto.clienteId);
    }

    if (updateAppuntamentoDto.pozzoId) {
      updateData.pozzoId = new Types.ObjectId(updateAppuntamentoDto.pozzoId);
    }

    const appuntamento = await this.appuntamentoModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('clienteId')
      .populate('pozzoId')
      .exec();

    if (!appuntamento) {
      throw new NotFoundException(`Appuntamento con ID ${id} non trovato`);
    }

    return appuntamento;
  }

  async remove(id: string): Promise<void> {
    const result = await this.appuntamentoModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Appuntamento con ID ${id} non trovato`);
    }
  }

  // Metodo per ottenere statistiche
  async getStats(): Promise<{
    totale: number;
    programmati: number;
    completati: number;
    annullati: number;
    oggi: number;
    settimana: number;
  }> {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    const domani = new Date(oggi);
    domani.setDate(domani.getDate() + 1);

    const inizioSettimana = new Date(oggi);
    inizioSettimana.setDate(inizioSettimana.getDate() - inizioSettimana.getDay());

    const fineSettimana = new Date(inizioSettimana);
    fineSettimana.setDate(fineSettimana.getDate() + 7);

    const [
      totale,
      programmati,
      completati,
      annullati,
      oggiCount,
      settimanaCount,
    ] = await Promise.all([
      this.appuntamentoModel.countDocuments().exec(),
      this.appuntamentoModel.countDocuments({ stato: 'Programmato' }).exec(),
      this.appuntamentoModel.countDocuments({ stato: 'Completato' }).exec(),
      this.appuntamentoModel.countDocuments({ stato: 'Annullato' }).exec(),
      this.appuntamentoModel
        .countDocuments({
          dataOra: { $gte: oggi, $lt: domani },
        })
        .exec(),
      this.appuntamentoModel
        .countDocuments({
          dataOra: { $gte: inizioSettimana, $lt: fineSettimana },
        })
        .exec(),
    ]);

    return {
      totale,
      programmati,
      completati,
      annullati,
      oggi: oggiCount,
      settimana: settimanaCount,
    };
  }
}