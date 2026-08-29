import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { BackupData } from './backup.types';

@Injectable()
export class BackupService {
  constructor(private readonly prisma: PrismaService) {}

  async exportFerma(fermaId: string): Promise<BackupData> {
    const ferma = await this.prisma.ferma.findUniqueOrThrow({ where: { id: fermaId } });

    const [pasari, perechi, serii, oua] = await Promise.all([
      this.prisma.pasare.findMany({ where: { fermaId } }),
      this.prisma.pereche.findMany({ where: { fermaId } }),
      this.prisma.serieCuibarit.findMany({ where: { pereche: { fermaId } } }),
      this.prisma.ou.findMany({ where: { serie: { pereche: { fermaId } } } }),
    ]);

    return {
      versiune: 1,
      dataExport: new Date().toISOString(),
      fermaNume: ferma.nume,
      pasari,
      perechi,
      serii,
      oua,
    };
  }

  valideazaStructura(backup: unknown): asserts backup is BackupData {
    if (!backup || typeof backup !== 'object') {
      throw new BadRequestException('Fisierul de backup nu este JSON valid');
    }
    const b = backup as Record<string, unknown>;
    for (const camp of ['pasari', 'perechi', 'serii', 'oua']) {
      if (!Array.isArray(b[camp])) {
        throw new BadRequestException(`Fisierul de backup nu are structura asteptata (lipseste "${camp}")`);
      }
    }
    for (const p of b.pasari as unknown[]) {
      const pasare = p as Record<string, unknown>;
      if (typeof pasare.id !== 'string' || typeof pasare.nrInel !== 'string') {
        throw new BadRequestException('Fisierul de backup are inregistrari de pasari invalide');
      }
    }
  }

  async restoreFerma(fermaId: string, backup: BackupData) {
    this.valideazaStructura(backup);

    const idPasariCunoscute = new Set(backup.pasari.map((p) => p.id));
    for (const p of backup.pasari) {
      if (p.tataId && !idPasariCunoscute.has(p.tataId)) {
        throw new BadRequestException('Backup invalid: un tata referit nu exista in acelasi backup');
      }
      if (p.mamaId && !idPasariCunoscute.has(p.mamaId)) {
        throw new BadRequestException('Backup invalid: o mama referita nu exista in acelasi backup');
      }
    }
    const idPerechiCunoscute = new Set(backup.perechi.map((p) => p.id));
    for (const s of backup.serii) {
      if (!idPerechiCunoscute.has(s.perecheId)) {
        throw new BadRequestException('Backup invalid: o serie refera o pereche inexistenta in backup');
      }
    }
    const idSeriiCunoscute = new Set(backup.serii.map((s) => s.id));
    for (const o of backup.oua) {
      if (!idSeriiCunoscute.has(o.serieId)) {
        throw new BadRequestException('Backup invalid: un ou refera o serie inexistenta in backup');
      }
      if (o.pasareId && !idPasariCunoscute.has(o.pasareId)) {
        throw new BadRequestException('Backup invalid: un ou refera o pasare inexistenta in backup');
      }
    }

    await this.prisma.$transaction(
      async (tx) => {
        await tx.ou.deleteMany({ where: { serie: { pereche: { fermaId } } } });
        await tx.serieCuibarit.deleteMany({ where: { pereche: { fermaId } } });
        await tx.pereche.deleteMany({ where: { fermaId } });
        await tx.pasare.deleteMany({ where: { fermaId } });

        for (const p of backup.pasari) {
          await tx.pasare.create({
            data: {
              id: p.id,
              fermaId,
              nrInel: p.nrInel,
              rnc: p.rnc,
              dataEclozare: p.dataEclozare ? new Date(p.dataEclozare) : null,
              anEclozare: p.dataEclozare ? new Date(p.dataEclozare).getFullYear() : null,
              sex: p.sex as never,
              mutatii: p.mutatii ?? [],
              observatii: p.observatii,
              status: p.status as never,
              achizitionataDinAfara: p.achizitionataDinAfara ?? false,
              dataCreare: new Date(p.dataCreare),
            },
          });
        }

        for (const p of backup.pasari) {
          if (p.tataId || p.mamaId) {
            await tx.pasare.update({
              where: { id: p.id },
              data: { tataId: p.tataId ?? null, mamaId: p.mamaId ?? null },
            });
          }
        }

        for (const per of backup.perechi) {
          await tx.pereche.create({
            data: {
              id: per.id,
              fermaId,
              masculId: per.masculId,
              femelaId: per.femelaId,
              status: per.status as never,
              dataCreare: new Date(per.dataCreare),
            },
          });
        }

        for (const s of backup.serii) {
          await tx.serieCuibarit.create({
            data: {
              id: s.id,
              perecheId: s.perecheId,
              dataImperechere: s.dataImperechere ? new Date(s.dataImperechere) : null,
              dataPrimOu: s.dataPrimOu ? new Date(s.dataPrimOu) : null,
              dataCreare: new Date(s.dataCreare),
            },
          });
        }

        for (const o of backup.oua) {
          await tx.ou.create({
            data: {
              id: o.id,
              serieId: o.serieId,
              dataDepunere: new Date(o.dataDepunere),
              status: o.status as never,
              pasareId: o.pasareId ?? null,
            },
          });
        }
      },
      { timeout: 30_000 },
    );

    return {
      success: true,
      restaurat: {
        pasari: backup.pasari.length,
        perechi: backup.perechi.length,
        serii: backup.serii.length,
        oua: backup.oua.length,
      },
    };
  }
}
