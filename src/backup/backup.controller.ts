import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Delete, 
  HttpCode, 
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { BackupService } from './backup.service';

@Controller('api/backup')
export class BackupController {
  private readonly logger = new Logger(BackupController.name);

  constructor(private readonly backupService: BackupService) {}

  /**
   * GET /api/backup/export
   * Esporta tutti i dati in formato backup JSON
   */
  @Get('export')
  async exportBackup() {
    try {
      this.logger.log('📥 Richiesta esportazione backup');
      const backup = await this.backupService.exportAllData();
      this.logger.log('✅ Backup esportato con successo');
      return backup;
    } catch (error) {
      this.logger.error('❌ Errore esportazione backup:', error);
      throw new InternalServerErrorException('Errore durante l\'esportazione del backup');
    }
  }

  /**
   * POST /api/backup/import
   * Importa un backup completo (sovrascrive tutti i dati)
   */
  @Post('import')
  @HttpCode(HttpStatus.OK)
  async importBackup(@Body() backupData: any) {
    try {
      this.logger.log('📤 Richiesta importazione backup');
      
      // Validazione base
      if (!backupData || !backupData.data) {
        throw new BadRequestException('Formato backup non valido');
      }

      if (!backupData.data.pozzi || !backupData.data.clienti || !backupData.data.bolle) {
        throw new BadRequestException('Il backup deve contenere pozzi, clienti e bolle');
      }

      const result = await this.backupService.importAllData(backupData);
      this.logger.log('✅ Backup importato con successo');
      return result;
      
    } catch (error) {
      this.logger.error('❌ Errore importazione backup:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException(
        error.message || 'Errore durante l\'importazione del backup'
      );
    }
  }

  /**
   * DELETE /api/backup/clear-all
   * Cancella tutti i dati (ATTENZIONE: irreversibile!)
   */
  @Delete('clear-all')
  @HttpCode(HttpStatus.OK)
  async clearAllData() {
    try {
      this.logger.warn('⚠️  Richiesta cancellazione di tutti i dati');
      const result = await this.backupService.clearAllData();
      this.logger.log('✅ Tutti i dati sono stati cancellati');
      return result;
    } catch (error) {
      this.logger.error('❌ Errore cancellazione dati:', error);
      throw new InternalServerErrorException('Errore durante la cancellazione dei dati');
    }
  }
}