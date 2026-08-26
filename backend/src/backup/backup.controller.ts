import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/types/jwt-payload.type';
import { BackupService } from './backup.service';
import { RestoreBackupDto } from './dto/restore-backup.dto';
import { R2BackupStorageService } from './r2-backup-storage.service';

const MARIME_MAXIMA = 20 * 1024 * 1024;

@UseGuards(JwtAuthGuard)
@Controller('backup')
export class BackupController {
  constructor(
    private readonly backupService: BackupService,
    private readonly storage: R2BackupStorageService,
  ) {}

  @Get('export')
  async export(@CurrentUser() user: CurrentUserData, @Res() res: Response) {
    const backup = await this.backupService.exportFerma(user.fermaId);
    const data = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup-animaltrack-${data}.json"`);
    res.send(JSON.stringify(backup, null, 2));
  }

  @Post('restore')
  @UseInterceptors(FileInterceptor('fisier', { limits: { fileSize: MARIME_MAXIMA } }))
  async restore(
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() fisier: Express.Multer.File,
    @Body() dto: RestoreBackupDto,
  ) {
    if (!fisier) {
      throw new BadRequestException('Fisierul de backup lipseste');
    }

    let backup: unknown;
    try {
      backup = JSON.parse(fisier.buffer.toString('utf-8'));
    } catch {
      throw new BadRequestException('Fisierul nu este JSON valid');
    }

    this.backupService.valideazaStructura(backup);
    return this.backupService.restoreFerma(user.fermaId, backup);
  }

  @Get('auto')
  async listaAutomate(@CurrentUser() user: CurrentUserData) {
    const backupuri = await this.storage.listeaza(user.fermaId);
    return backupuri.map((b) => ({
      fisier: b.cheie.split('/').pop(),
      dataCreare: b.dataCreare,
      marime: b.marime,
    }));
  }

  @Get('auto/:fisier')
  async descarcaAutomat(
    @CurrentUser() user: CurrentUserData,
    @Param('fisier') fisier: string,
    @Res() res: Response,
  ) {
    if (!/^\d+\.json$/.test(fisier)) {
      throw new BadRequestException('Nume de fisier invalid');
    }

    const cheie = `backups/${user.fermaId}/${fisier}`;
    if (!this.storage.apartineFermei(cheie, user.fermaId)) {
      throw new ForbiddenException();
    }

    try {
      const continut = await this.storage.descarca(cheie);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${fisier}"`);
      res.send(continut);
    } catch {
      throw new NotFoundException('Backup-ul nu a fost gasit');
    }
  }
}
