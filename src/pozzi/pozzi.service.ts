import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pozzo, PozzoDocument } from './schemas/pozzo.schema';
import { CreatePozzoDto } from './dto/create-pozzo.dto';
import { UpdatePozzoDto } from './dto/update-pozzo.dto';

@Injectable()
export class PozziService {
  constructor(
    @InjectModel(Pozzo.name) private pozzoModel: Model<PozzoDocument>,
  ) {}

  async create(createPozzoDto: CreatePozzoDto): Promise<Pozzo> {
    const createdPozzo = new this.pozzoModel(createPozzoDto);
    return createdPozzo.save();
  }

  async findAll(): Promise<Pozzo[]> {
    return this.pozzoModel.find().sort({ nome: 1 }).exec();
  }

  async findOne(id: string): Promise<Pozzo> {
    const pozzo = await this.pozzoModel.findById(id).exec();
    if (!pozzo) {
      throw new NotFoundException(`Pozzo con ID ${id} non trovato`);
    }
    return pozzo;
  }

  async update(id: string, updatePozzoDto: UpdatePozzoDto): Promise<Pozzo> {
    const updatedPozzo = await this.pozzoModel
      .findByIdAndUpdate(id, updatePozzoDto, { new: true })
      .exec();
    if (!updatedPozzo) {
      throw new NotFoundException(`Pozzo con ID ${id} non trovato`);
    }
    return updatedPozzo;
  }

  async remove(id: string): Promise<void> {
    const result = await this.pozzoModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Pozzo con ID ${id} non trovato`);
    }
  }
}