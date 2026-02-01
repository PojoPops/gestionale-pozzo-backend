import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pozzo, PozzoDocument } from '../pozzi/schemas/pozzo.schema';
import { Cliente, ClienteDocument } from '../clienti/schemas/cliente.schema';
import { Bolla, BollaDocument } from '../bolle/schemas/bolla.schema';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    @InjectModel(Pozzo.name) private pozzoModel: Model<PozzoDocument>,
    @InjectModel(Cliente.name) private clienteModel: Model<ClienteDocument>,
    @InjectModel(Bolla.name) private bollaModel: Model<BollaDocument>,
  ) {}

  /**
   * Esporta tutti i dati in formato backup
   */
  async exportAllData() {
    this.logger.log('📦 Esportazione backup in corso...');

    const [pozzi, clienti, bolle] = await Promise.all([
      this.pozzoModel.find().lean().exec(),
      this.clienteModel.find().lean().exec(),
      this.bollaModel.find().lean().exec(),
    ]);

    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        pozzi,
        clienti,
        bolle,
      },
      stats: {
        pozzi: pozzi.length,
        clienti: clienti.length,
        bolle: bolle.length,
      },
    };

    this.logger.log(`✅ Backup creato: ${pozzi.length} pozzi, ${clienti.length} clienti, ${bolle.length} bolle`);
    return backup;
  }

  /**
   * Importa un backup completo sovrascrivendo tutti i dati
   * GESTISCE CORRETTAMENTE LA SOSTITUZIONE DEGLI ID E LE RELAZIONI
   */
  async importAllData(backupData: any) {
    if (!backupData.version || !backupData.data) {
      throw new Error('Formato backup non valido');
    }

    const { pozzi, clienti, bolle } = backupData.data;

    if (!pozzi || !clienti || !bolle) {
      throw new Error('Il backup deve contenere pozzi, clienti e bolle');
    }

    this.logger.log('🔄 Inizio importazione backup...');
    this.logger.log(`📊 Dati da importare: ${pozzi.length} pozzi, ${clienti.length} clienti, ${bolle.length} bolle`);

    // Mappe per tracciare vecchi ID -> nuovi ID
    const pozziIdMap = new Map<string, string>();
    const clientiIdMap = new Map<string, string>();

    try {
      // STEP 1: Elimina tutti i dati esistenti
      this.logger.log('🗑️  Eliminazione dati esistenti...');
      await this.clearAllData();

      // STEP 2: Importa i pozzi (devono essere creati per primi)
      this.logger.log('⬆️  Importazione pozzi...');
      const pozziImportati: PozzoDocument[] = [];
      
      for (const pozzoData of pozzi) {
        const vecchioId = pozzoData._id.toString();
        
        // Rimuovi campi che non devono essere importati
        const { _id, __v, createdAt, updatedAt, ...pozzoClean } = pozzoData;
        
        // Crea nuovo pozzo con nuovo ID
        const nuovoPozzo = await this.pozzoModel.create(pozzoClean);
        
        // Mappa vecchio ID -> nuovo ID
        pozziIdMap.set(vecchioId, nuovoPozzo._id.toString());
        pozziImportati.push(nuovoPozzo as PozzoDocument);
      }
      
      this.logger.log(`✅ ${pozziImportati.length} pozzi importati`);

      // STEP 3: Importa i clienti (sostituendo i riferimenti ai pozzi)
      this.logger.log('⬆️  Importazione clienti...');
      const clientiImportati: ClienteDocument[] = [];
      
      for (const clienteData of clienti) {
        const vecchioId = clienteData._id.toString();
        const { _id, __v, createdAt, updatedAt, ...clienteClean } = clienteData;

        // Sostituisci i vecchi ID dei pozzi con i nuovi ID
        if (clienteClean.pozziIds && Array.isArray(clienteClean.pozziIds)) {
          clienteClean.pozziIds = clienteClean.pozziIds
            .map((vecchioPozzoId: any) => {
              const vecchioIdStr = vecchioPozzoId.toString();
              const nuovoId = pozziIdMap.get(vecchioIdStr);
              
              if (!nuovoId) {
                this.logger.warn(`⚠️  Pozzo ${vecchioIdStr} non trovato per cliente ${clienteData.nome}`);
                return null;
              }
              
              return new Types.ObjectId(nuovoId);
            })
            .filter(Boolean); // Rimuovi i null
        }

        // Crea nuovo cliente con nuovo ID
        const nuovoCliente = await this.clienteModel.create(clienteClean);
        
        // Mappa vecchio ID -> nuovo ID
        clientiIdMap.set(vecchioId, nuovoCliente._id.toString());
        clientiImportati.push(nuovoCliente as ClienteDocument);
      }
      
      this.logger.log(`✅ ${clientiImportati.length} clienti importati`);

      // STEP 4: Importa le bolle (sostituendo i riferimenti a clienti e pozzi)
      this.logger.log('⬆️  Importazione bolle...');
      const bolleImportate: BollaDocument[] = [];
      
      for (const bollaData of bolle) {
        const { _id, __v, createdAt, updatedAt, ...bollaClean } = bollaData;

        // Estrai gli ID (possono essere oggetti o stringhe)
        const vecchioClienteId = typeof bollaClean.clienteId === 'object' && bollaClean.clienteId._id
          ? bollaClean.clienteId._id.toString()
          : bollaClean.clienteId.toString();
          
        const vecchioPozzoId = typeof bollaClean.pozzoId === 'object' && bollaClean.pozzoId._id
          ? bollaClean.pozzoId._id.toString()
          : bollaClean.pozzoId.toString();

        // Trova i nuovi ID
        const nuovoClienteId = clientiIdMap.get(vecchioClienteId);
        const nuovoPozzoId = pozziIdMap.get(vecchioPozzoId);

        if (!nuovoClienteId || !nuovoPozzoId) {
          this.logger.warn(`⚠️  Riferimenti non validi per bolla ${bollaData.numeroBolla}, saltata`);
          continue;
        }

        // Sostituisci con i nuovi ID
        bollaClean.clienteId = new Types.ObjectId(nuovoClienteId);
        bollaClean.pozzoId = new Types.ObjectId(nuovoPozzoId);

        // Crea nuova bolla con nuovo ID
        const nuovaBolla = await this.bollaModel.create(bollaClean);
        bolleImportate.push(nuovaBolla as BollaDocument);
      }
      
      this.logger.log(`✅ ${bolleImportate.length} bolle importate`);

      const result = {
        success: true,
        message: 'Backup importato con successo',
        stats: {
          pozzi: pozziImportati.length,
          clienti: clientiImportati.length,
          bolle: bolleImportate.length,
        },
      };

      this.logger.log('🎉 Importazione completata!', result.stats);
      return result;

    } catch (error) {
      this.logger.error('❌ Errore durante l\'importazione:', error);
      
      // In caso di errore, prova a ripulire i dati parzialmente importati
      this.logger.warn('🔄 Tentativo di rollback...');
      await this.clearAllData();
      
      throw new Error(`Errore durante l'importazione del backup: ${error.message}`);
    }
  }

  /**
   * Cancella tutti i dati (ATTENZIONE: irreversibile!)
   */
  async clearAllData() {
    this.logger.log('🗑️  Cancellazione di tutti i dati...');
    
    const results = await Promise.all([
      this.bollaModel.deleteMany({}).exec(),
      this.clienteModel.deleteMany({}).exec(),
      this.pozzoModel.deleteMany({}).exec(),
    ]);

    const stats = {
      bolle: results[0].deletedCount || 0,
      clienti: results[1].deletedCount || 0,
      pozzi: results[2].deletedCount || 0,
    };

    this.logger.log('✅ Dati cancellati:', stats);
    
    return {
      success: true,
      message: 'Tutti i dati sono stati eliminati',
      stats,
    };
  }
}