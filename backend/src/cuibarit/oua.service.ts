import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { StatusOu } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOuDto } from './dto/create-ou.dto';
import { EclozeazaDto } from './dto/eclozeaza.dto';
import { UpdateOuDto } from './dto/update-ou.dto';

@Injectable()
export class OuaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(fermaId: string, serieId: string, dto: CreateOuDto) {
    const serie = await this.prisma.serieCuibarit.findFirst({
      where: { id: serieId, pereche: { fermaId } },
    });
    if (!serie) {
      throw new NotFoundException('Seria de cuibarit nu a fost gasita');
    }

    const dataDepunere = dto.dataDepunere ?? new Date();

    const ou = await this.prisma.ou.create({
      data: { serieId, dataDepunere, status: StatusOu.DEPUS },
    });

    if (!serie.dataPrimOu) {
      await this.prisma.serieCuibarit.update({
        where: { id: serieId },
        data: { dataPrimOu: dataDepunere },
      });
    }

    return ou;
  }

  async updateStatus(fermaId: string, id: string, dto: UpdateOuDto) {
    const ou = await this.prisma.ou.findFirst({ where: { id, serie: { pereche: { fermaId } } } });
    if (!ou) {
      throw new NotFoundException('Oul nu a fost gasit');
    }

    return this.prisma.ou.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async eclozeaza(fermaId: string, id: string, dto: EclozeazaDto) {
    const ou = await this.prisma.ou.findFirst({
      where: { id, serie: { pereche: { fermaId } } },
      include: { serie: { include: { pereche: true } } },
    });
    if (!ou) {
      throw new NotFoundException('Oul nu a fost gasit');
    }

    if (ou.pasareId) {
      throw new ConflictException('Acest ou este deja legat de o pasare');
    }

    const pereche = ou.serie.pereche;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const pasare = await tx.pasare.create({
          data: {
            fermaId,
            nrInel: dto.nrInel,
            rnc: dto.rnc,
            dataEclozare: dto.dataEclozare,
            sex: dto.sex,
            mutatii: dto.mutatii ?? [],
            observatii: dto.observatii,
            tataId: pereche.masculId,
            mamaId: pereche.femelaId,
          },
        });

        return tx.ou.update({
          where: { id },
          data: { status: StatusOu.ECLOZAT, pasareId: pasare.id },
          include: { pasare: true },
        });
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Exista deja o pasare cu acest nr. de inel in ferma ta');
      }
      throw err;
    }
  }
}
