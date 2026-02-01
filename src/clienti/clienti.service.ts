import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cliente, ClienteDocument } from './schemas/cliente.schema';
import { Bolla, BollaDocument } from '../bolle/schemas/bolla.schema';
import { Appuntamento, AppuntamentoDocument } from '../appuntamenti/schemas/appuntamento.schema';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientiService {
  constructor(
    @InjectModel(Cliente.name) private clienteModel: Model<ClienteDocument>,
    @InjectModel(Bolla.name) private bollaModel: Model<BollaDocument>,
    @InjectModel(Appuntamento.name) private appuntamentoModel: Model<AppuntamentoDocument>,
  ) {
    // Log per verificare che i model siano stati iniettati correttamente
    console.log('✅ ClientiService: Cliente model injected:', !!this.clienteModel);
    console.log('✅ ClientiService: Bolla model injected:', !!this.bollaModel);
    console.log('✅ ClientiService: Appuntamento model injected:', !!this.appuntamentoModel);
  }

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const pozziObjectIds = createClienteDto.pozziIds?.map(id => new Types.ObjectId(id)) || [];
    const createdCliente = new this.clienteModel({
      ...createClienteDto,
      pozziIds: pozziObjectIds,
    });
    return createdCliente.save();
  }

  async findAll(): Promise<Cliente[]> {
    return this.clienteModel
      .find()
      .populate('pozziIds')
      .sort({ cognome: 1, nome: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clienteModel
      .findById(id)
      .populate('pozziIds')
      .exec();
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} non trovato`);
    }
    return cliente;
  }

  async findByPozzo(pozzoId: string): Promise<Cliente[]> {
    return this.clienteModel
      .find({ pozziIds: new Types.ObjectId(pozzoId) })
      .sort({ cognome: 1, nome: 1 })
      .exec();
  }

  async update(id: string, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    const pozziObjectIds = updateClienteDto.pozziIds?.map(id => new Types.ObjectId(id));
    const updatedCliente = await this.clienteModel
      .findByIdAndUpdate(
        id,
        { ...updateClienteDto, ...(pozziObjectIds && { pozziIds: pozziObjectIds }) },
        { new: true }
      )
      .populate('pozziIds')
      .exec();
    if (!updatedCliente) {
      throw new NotFoundException(`Cliente con ID ${id} non trovato`);
    }
    return updatedCliente;
  }

  async remove(id: string): Promise<void> {
    console.log('🗑️ Tentativo di eliminazione cliente:', id);
    
    // Prima verifica se il cliente esiste
    const cliente = await this.clienteModel.findById(id).exec();
    if (!cliente) {
      console.log('❌ Cliente non trovato:', id);
      throw new NotFoundException(`Cliente con ID ${id} non trovato`);
    }

    console.log('✅ Cliente trovato:', cliente.nome, cliente.cognome);

    // Verifica se i model sono disponibili
    if (!this.bollaModel) {
      console.error('❌ ERRORE: bollaModel non è stato iniettato!');
      throw new Error('Bolla model non disponibile');
    }
    if (!this.appuntamentoModel) {
      console.error('❌ ERRORE: appuntamentoModel non è stato iniettato!');
      throw new Error('Appuntamento model non disponibile');
    }

    const clienteObjectId = new Types.ObjectId(id);

    // Verifica se esistono bolle associate al cliente
    console.log('🔍 Controllo bolle per cliente:', id);
    const bolleCount = await this.bollaModel.countDocuments({ 
      clienteId: clienteObjectId 
    }).exec();
    console.log('📊 Numero bolle trovate:', bolleCount);

    // Verifica se esistono appuntamenti associati al cliente
    console.log('🔍 Controllo appuntamenti per cliente:', id);
    const appuntamentiCount = await this.appuntamentoModel.countDocuments({ 
      clienteId: clienteObjectId 
    }).exec();
    console.log('📊 Numero appuntamenti trovati:', appuntamentiCount);

    // Costruisci il messaggio di errore in base a cosa è stato trovato
    const errori: string[] = [];
    
    if (bolleCount > 0) {
      errori.push(
        `${bolleCount} ${bolleCount === 1 ? 'bolla associata' : 'bolle associate'}`
      );
    }
    
    if (appuntamentiCount > 0) {
      errori.push(
        `${appuntamentiCount} ${appuntamentiCount === 1 ? 'appuntamento associato' : 'appuntamenti associati'}`
      );
    }

    if (errori.length > 0) {
      const errorMessage = 
        `Impossibile eliminare il cliente ${cliente.nome} ${cliente.cognome}: ` +
        `ci ${errori.length === 1 ? 'sono' : 'sono'} ${errori.join(' e ')}. ` +
        `Elimina prima ${bolleCount > 0 && appuntamentiCount > 0 ? 'le bolle e gli appuntamenti' : 
                        bolleCount > 0 ? (bolleCount === 1 ? 'la bolla' : 'le bolle') : 
                        (appuntamentiCount === 1 ? 'l\'appuntamento' : 'gli appuntamenti')} per procedere.`;
      
      console.log('🚫 Eliminazione bloccata:', errorMessage);
      throw new BadRequestException(errorMessage);
    }

    // Se non ci sono né bolle né appuntamenti, procedi con l'eliminazione
    console.log('✅ Nessuna bolla o appuntamento trovato, procedo con eliminazione...');
    await this.clienteModel.findByIdAndDelete(id).exec();
    console.log('✅ Cliente eliminato con successo');
  }
}