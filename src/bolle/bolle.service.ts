// Backend: src/bolle/bolle.service.ts

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bolla, BollaDocument } from './schemas/bolla.schema';
import { CreateBollaDto } from './dto/create-bolla.dto';
import { UpdateBollaDto } from './dto/update-bolla.dto';
import { ExportPdfDto } from './dto/export-pdf.dto';
// ⚠️ CORRETTO: Import PDFKit in questo modo
import * as PDFDocument from 'pdfkit';

@Injectable()
export class BolleService {
  constructor(
    @InjectModel(Bolla.name) private bollaModel: Model<BollaDocument>,
  ) {}

  async create(createBollaDto: CreateBollaDto): Promise<Bolla> {
    const pozzoId = new Types.ObjectId(createBollaDto.pozzoId);
    
    const existingBolla = await this.bollaModel.findOne({
      pozzoId,
      numeroBolla: createBollaDto.numeroBolla,
    });

    if (existingBolla) {
      throw new ConflictException(
        `Esiste già una bolla con numero ${createBollaDto.numeroBolla} per questo pozzo`
      );
    }

    const createdBolla = new this.bollaModel({
      ...createBollaDto,
      clienteId: new Types.ObjectId(createBollaDto.clienteId),
      pozzoId,
    });
    
    return createdBolla.save();
  }

  async getNextNumeroBolla(pozzoId: string): Promise<string> {
    const lastBolla = await this.bollaModel
      .findOne({ pozzoId: new Types.ObjectId(pozzoId) })
      .sort({ numeroBolla: -1 })
      .exec();

    if (!lastBolla) {
      return '1';
    }

    const lastNumber = parseInt(lastBolla.numeroBolla, 10);
    if (isNaN(lastNumber)) {
      return '1';
    }

    return String(lastNumber + 1);
  }

  async findAll(): Promise<Bolla[]> {
    return this.bollaModel
      .find()
      .populate('clienteId')
      .populate('pozzoId')
      .sort({ data: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Bolla> {
    const bolla = await this.bollaModel
      .findById(id)
      .populate('clienteId')
      .populate('pozzoId')
      .exec();
    if (!bolla) {
      throw new NotFoundException(`Bolla con ID ${id} non trovata`);
    }
    return bolla;
  }

  async findByCliente(clienteId: string): Promise<Bolla[]> {
    return this.bollaModel
      .find({ clienteId: new Types.ObjectId(clienteId) })
      .populate('pozzoId')
      .sort({ data: -1 })
      .exec();
  }

  async findByPozzo(pozzoId: string): Promise<Bolla[]> {
    return this.bollaModel
      .find({ pozzoId: new Types.ObjectId(pozzoId) })
      .populate('clienteId')
      .sort({ data: -1 })
      .exec();
  }

  async findByClienteAndPozzo(clienteId: string, pozzoId: string): Promise<Bolla[]> {
    return this.bollaModel
      .find({
        clienteId: new Types.ObjectId(clienteId),
        pozzoId: new Types.ObjectId(pozzoId),
      })
      .sort({ data: -1 })
      .exec();
  }

  async update(id: string, updateBollaDto: UpdateBollaDto): Promise<Bolla> {
    if (updateBollaDto.numeroBolla || updateBollaDto.pozzoId) {
      const currentBolla = await this.bollaModel.findById(id);
      if (!currentBolla) {
        throw new NotFoundException(`Bolla con ID ${id} non trovata`);
      }

      const newPozzoId = updateBollaDto.pozzoId 
        ? new Types.ObjectId(updateBollaDto.pozzoId)
        : currentBolla.pozzoId;
      const newNumeroBolla = updateBollaDto.numeroBolla || currentBolla.numeroBolla;

      const existingBolla = await this.bollaModel.findOne({
        _id: { $ne: id },
        pozzoId: newPozzoId,
        numeroBolla: newNumeroBolla,
      });

      if (existingBolla) {
        throw new ConflictException(
          `Esiste già una bolla con numero ${newNumeroBolla} per questo pozzo`
        );
      }
    }

    const updateData: any = { ...updateBollaDto };
    if (updateBollaDto.clienteId) {
      updateData.clienteId = new Types.ObjectId(updateBollaDto.clienteId);
    }
    if (updateBollaDto.pozzoId) {
      updateData.pozzoId = new Types.ObjectId(updateBollaDto.pozzoId);
    }
    
    const updatedBolla = await this.bollaModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('clienteId')
      .populate('pozzoId')
      .exec();
      
    if (!updatedBolla) {
      throw new NotFoundException(`Bolla con ID ${id} non trovata`);
    }
    
    return updatedBolla;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bollaModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Bolla con ID ${id} non trovata`);
    }
  }

  async exportPdf(exportPdfDto: ExportPdfDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // ⚠️ CORRETTO: Usa "new PDFDocument()" invece di "new PDFDocument.default()"
        const doc = new (PDFDocument as any)({ 
          size: 'A4',
          margin: 50,
          bufferPages: true
        });

        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Colori
        const primaryColor = '#1e40af';
        const lightGray = '#f3f4f6';
        const darkGray = '#4b5563';
        const textColor = '#1f2937';

        // Titolo
        doc.fontSize(24)
           .fillColor(primaryColor)
           .text('Elenco Bolle', { align: 'center' });

        // Data generazione
        const now = new Date();
        const dateStr = `Generato il ${now.toLocaleDateString('it-IT')} alle ${now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
        doc.fontSize(10)
           .fillColor(darkGray)
           .text(dateStr, { align: 'center' })
           .moveDown(1.5);

        // Filtri applicati
        if (exportPdfDto.filtri && exportPdfDto.filtri.length > 0) {
          doc.fontSize(14)
             .fillColor(primaryColor)
             .text('Filtri Applicati:', 50, doc.y, { align: 'left' })
             .moveDown(0.3);

          doc.fontSize(10)
             .fillColor(textColor);
          
          exportPdfDto.filtri.forEach(filtro => {
            doc.text(`• ${filtro}`);
          });
          
          doc.moveDown(1);
        }

        // Statistiche
        if (exportPdfDto.stats) {
          doc.fontSize(14)
             .fillColor(primaryColor)
             .text('Riepilogo Statistiche:', 50, doc.y, { align: 'left' })
             .moveDown(0.5);

          const stats = exportPdfDto.stats;
          const statsData = [
            ['Totale Bolle:', stats.totaleBolle.toString()],
            ['Fatturato Totale:', `€ ${stats.totaleFatturato}`],
            ['Totale Acconti:', `€ ${stats.totaleAcconti}`],
            ['Totale m³:', stats.totaleMetriCubi],
            ['Totale Ore:', stats.totaleOre]
          ];

          const tableLeft = 50;
          let tableTop = doc.y;
          const colWidth = 250;
          const rowHeight = 25;

          statsData.forEach((row, i) => {
            const y = tableTop + (i * rowHeight);
            
            if (i % 2 === 0) {
              doc.rect(tableLeft, y, colWidth * 2, rowHeight)
                 .fill(lightGray);
            }

            doc.fontSize(10)
               .fillColor(textColor)
               .font('Helvetica-Bold')
               .text(row[0], tableLeft + 5, y + 7, { width: colWidth - 10 })
               .font('Helvetica')
               .text(row[1], tableLeft + colWidth + 5, y + 7, { width: colWidth - 10, align: 'right' });
          });

          doc.y = tableTop + (statsData.length * rowHeight) + 20;
        }

        // Tabella bolle
        if (exportPdfDto.bolle && exportPdfDto.bolle.length > 0) {
          doc.fontSize(14)
             .fillColor(primaryColor)
             .text('Dettaglio Bolle:', 50, doc.y, { align: 'left' })
             .moveDown(0.5);

          const headers = ['N. Bolla', 'Data', 'Cliente', 'Pozzo', 'm³', 'Ore', 'Totale', 'Acconto', 'Saldato'];
          const colWidths = [45, 55, 120, 95, 35, 35, 55, 55, 45];
          const tableLeft = 40;
          let tableTop = doc.y;
          const rowHeight = 20;

          // Background header
          doc.rect(tableLeft, tableTop, colWidths.reduce((a, b) => a + b, 0), rowHeight)
             .fill(primaryColor);

          // Testo header
          let xPos = tableLeft;
          headers.forEach((header, i) => {
            doc.fontSize(8)
               .fillColor('white')
               .font('Helvetica-Bold')
               .text(header, xPos + 2, tableTop + 5, { 
                 width: colWidths[i] - 4, 
                 align: 'center',
                 lineBreak: false
               });
            xPos += colWidths[i];
          });

          tableTop += rowHeight;

          // Righe dati
          exportPdfDto.bolle.forEach((bolla, rowIndex) => {
            // Check se serve nuova pagina
            if (tableTop + rowHeight > doc.page.height - 50) {
              doc.addPage();
              tableTop = 50;
            }

            // Background alternato
            if (rowIndex % 2 === 0) {
              doc.rect(tableLeft, tableTop, colWidths.reduce((a, b) => a + b, 0), rowHeight)
                 .fill(lightGray);
            }

            // Dati riga
            const rowData = [
              bolla.numeroBolla,
              bolla.data,
              bolla.cliente.length > 22 ? bolla.cliente.substring(0, 21) + '...' : bolla.cliente,
              bolla.pozzo.length > 17 ? bolla.pozzo.substring(0, 16) + '...' : bolla.pozzo,
              bolla.metriCubi,
              bolla.ore,
              `€${bolla.importoTotale}`,
              `€${bolla.acconto}`,
              bolla.saldato
            ];

            xPos = tableLeft;
            rowData.forEach((data, i) => {
              doc.fontSize(7)
                 .fillColor(textColor)
                 .font('Helvetica')
                 .text(data, xPos + 2, tableTop + 5, { 
                   width: colWidths[i] - 4, 
                   align: i < 2 || i > 3 ? 'center' : 'left',
                   lineBreak: false
                 });
              xPos += colWidths[i];
            });

            tableTop += rowHeight;
          });
        }

        doc.end();
        console.log('✅ PDF generato con successo');
      } catch (error) {
        console.error('❌ Errore generazione PDF:', error);
        reject(new BadRequestException('Errore durante la generazione del PDF: ' + error.message));
      }
    });
  }

  async fixIndexes() {
    await this.bollaModel.collection.dropIndex('numeroBolla_1');
    console.log('Indice vecchio eliminato');
  }
}