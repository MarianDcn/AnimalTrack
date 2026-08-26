import { Module } from '@nestjs/common';
import { BackupController } from './backup.controller';
import { BackupCronService } from './backup-cron.service';
import { BackupService } from './backup.service';
import { R2BackupStorageService } from './r2-backup-storage.service';

@Module({
  controllers: [BackupController],
  providers: [BackupService, R2BackupStorageService, BackupCronService],
})
export class BackupModule {}
