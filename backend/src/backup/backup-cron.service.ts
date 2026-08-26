import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BackupService } from './backup.service';
import { R2BackupStorageService } from './r2-backup-storage.service';

const NR_BACKUP_URI_PASTRATE = 8;

@Injectable()
export class BackupCronService {
  private readonly logger = new Logger(BackupCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly backupService: BackupService,
    private readonly storage: R2BackupStorageService,
  ) {}

  @Cron(CronExpression.EVERY_WEEK)
  async backupSaptamanal() {
    const ferme = await this.prisma.ferma.findMany({ select: { id: true, nume: true } });
    this.logger.log(`Pornesc backup automat pentru ${ferme.length} ferme`);

    for (const ferma of ferme) {
      try {
        const backup = await this.backupService.exportFerma(ferma.id);
        await this.storage.upload(ferma.id, JSON.stringify(backup));
        await this.storage.pastreazaDoarUltimele(ferma.id, NR_BACKUP_URI_PASTRATE);
      } catch (err) {
        this.logger.error(`Backup automat esuat pentru ferma ${ferma.nume} (${ferma.id})`, err);
      }
    }

    this.logger.log('Backup automat saptamanal finalizat');
  }
}
