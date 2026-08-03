import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePasareDto } from './dto/create-pasare.dto';
import { UpdatePasareDto } from './dto/update-pasare.dto';

@Injectable()
export class PasariService {
  constructor(private readonly prisma: PrismaService) {}

  async create(fermaId: string, dto: CreatePasareDto) {
    await this.verificaParinti(fermaId, dto.tataId, dto.mamaId);

    try {
      return await this.prisma.pasare.create({
        data: { ...dto, fermaId },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Exista deja o pasare cu acest nr. de inel in ferma ta');
      }
      throw err;
    }
  }

  findAll(fermaId: string) {
    return this.prisma.pasare.findMany({
      where: { fermaId },
      orderBy: { dataCreare: 'desc' },
    });
  }

  async findOne(fermaId: string, id: string) {
    const pasare = await this.prisma.pasare.findFirst({ where: { id, fermaId } });
    if (!pasare) {
      throw new NotFoundException('Pasarea nu a fost gasita');
    }
    return pasare;
  }

  async update(fermaId: string, id: string, dto: UpdatePasareDto) {
    await this.findOne(fermaId, id);

    if (dto.tataId === id || dto.mamaId === id) {
      throw new BadRequestException('O pasare nu poate fi propriul ei parinte');
    }
    await this.verificaParinti(fermaId, dto.tataId, dto.mamaId);

    try {
      return await this.prisma.pasare.update({
        where: { id },
        data: dto,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Exista deja o pasare cu acest nr. de inel in ferma ta');
      }
      throw err;
    }
  }

  async remove(fermaId: string, id: string) {
    await this.findOne(fermaId, id);
    await this.prisma.pasare.delete({ where: { id } });
    return { success: true };
  }

  async cautaDupaNrInel(fermaId: string, nrInel: string) {
    const pasari = await this.prisma.pasare.findMany({
      where: { fermaId, nrInel: { contains: nrInel, mode: 'insensitive' } },
      include: {
        tata: { select: { id: true, nrInel: true } },
        mama: { select: { id: true, nrInel: true } },
      },
      take: 20,
      orderBy: { nrInel: 'asc' },
    });

    return pasari.map((p) => ({
      id: p.id,
      nrInel: p.nrInel,
      nume: p.nume,
      dataEclozare: p.dataEclozare,
      varsta: calculeazaVarsta(p.dataEclozare),
      sex: p.sex,
      mutatie: p.mutatie,
      tata: p.tata ? { id: p.tata.id, nrInel: p.tata.nrInel } : null,
      mama: p.mama ? { id: p.mama.id, nrInel: p.mama.nrInel } : null,
    }));
  }

  private async verificaParinti(fermaId: string, tataId?: string, mamaId?: string) {
    const idParinti = [tataId, mamaId].filter((id): id is string => Boolean(id));
    if (idParinti.length === 0) return;

    const gasite = await this.prisma.pasare.count({
      where: { id: { in: idParinti }, fermaId },
    });

    if (gasite !== idParinti.length) {
      throw new BadRequestException('Parintele indicat nu exista in ferma ta');
    }
  }
}

function calculeazaVarsta(dataEclozare: Date | null): { ani: number; luni: number } | null {
  if (!dataEclozare) return null;

  const acum = new Date();
  let ani = acum.getFullYear() - dataEclozare.getFullYear();
  let luni = acum.getMonth() - dataEclozare.getMonth();

  if (acum.getDate() < dataEclozare.getDate()) {
    luni -= 1;
  }
  if (luni < 0) {
    ani -= 1;
    luni += 12;
  }

  return { ani, luni };
}
