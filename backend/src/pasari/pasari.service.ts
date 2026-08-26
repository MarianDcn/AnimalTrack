import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
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
    try {
      await this.prisma.pasare.delete({ where: { id } });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        (err.code === 'P2003' || err.code === 'P2039')
      ) {
        throw new ConflictException(
          'Nu poti sterge aceasta pasare cat timp face parte dintr-o pereche. Sterge mai intai perechea.',
        );
      }
      throw err;
    }
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
      mutatii: p.mutatii,
      tata: p.tata ? { id: p.tata.id, nrInel: p.tata.nrInel } : null,
      mama: p.mama ? { id: p.mama.id, nrInel: p.mama.nrInel } : null,
    }));
  }

  async findRude(fermaId: string, id: string) {
    const pasare = await this.findOne(fermaId, id);

    const pui = await this.prisma.pasare.findMany({
      where: { fermaId, OR: [{ tataId: id }, { mamaId: id }] },
      orderBy: { dataCreare: 'desc' },
    });

    const frati =
      pasare.tataId && pasare.mamaId
        ? await this.prisma.pasare.findMany({
            where: {
              fermaId,
              id: { not: id },
              tataId: pasare.tataId,
              mamaId: pasare.mamaId,
            },
            orderBy: { dataCreare: 'desc' },
          })
        : [];

    return { frati, pui };
  }

  async getArbore(fermaId: string, id: string, generatiiSus: number, generatiiJos: number) {
    const pasare = await this.findOne(fermaId, id);

    const stramosi = await this.prisma.$queryRaw<RandArbore[]>`
      WITH RECURSIVE stramosi AS (
        SELECT id, nr_inel, nume, sex, mutatii, data_eclozare, tata_id, mama_id, 0 AS nivel
        FROM pasari
        WHERE id = ${id} AND ferma_id = ${fermaId}

        UNION ALL

        SELECT p.id, p.nr_inel, p.nume, p.sex, p.mutatii, p.data_eclozare, p.tata_id, p.mama_id, s.nivel + 1
        FROM pasari p
        JOIN stramosi s ON p.id = s.tata_id OR p.id = s.mama_id
        WHERE s.nivel < ${generatiiSus} AND p.ferma_id = ${fermaId}
      )
      SELECT * FROM stramosi WHERE nivel > 0;
    `;

    const descendenti = await this.prisma.$queryRaw<RandArbore[]>`
      WITH RECURSIVE descendenti AS (
        SELECT id, nr_inel, nume, sex, mutatii, data_eclozare, tata_id, mama_id, 0 AS nivel
        FROM pasari
        WHERE id = ${id} AND ferma_id = ${fermaId}

        UNION ALL

        SELECT p.id, p.nr_inel, p.nume, p.sex, p.mutatii, p.data_eclozare, p.tata_id, p.mama_id, d.nivel + 1
        FROM pasari p
        JOIN descendenti d ON p.tata_id = d.id OR p.mama_id = d.id
        WHERE d.nivel < ${generatiiJos} AND p.ferma_id = ${fermaId}
      )
      SELECT * FROM descendenti WHERE nivel > 0;
    `;

    const mapaStramosi = new Map(stramosi.map((r) => [r.id, r]));
    const mapaCopii = new Map<string, RandArbore[]>();
    for (const rand of descendenti) {
      if (rand.tata_id) mapaCopii.set(rand.tata_id, [...(mapaCopii.get(rand.tata_id) ?? []), rand]);
      if (rand.mama_id) mapaCopii.set(rand.mama_id, [...(mapaCopii.get(rand.mama_id) ?? []), rand]);
    }

    return {
      pasare: {
        id: pasare.id,
        nrInel: pasare.nrInel,
        nume: pasare.nume,
        sex: pasare.sex,
        mutatii: pasare.mutatii,
        dataEclozare: pasare.dataEclozare,
      },
      stramosi: {
        tata: construiesteStramos(pasare.tataId, mapaStramosi),
        mama: construiesteStramos(pasare.mamaId, mapaStramosi),
      },
      descendenti: construiesteDescendenti(pasare.id, mapaCopii, new Set([pasare.id])),
    };
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

export interface RandArbore {
  id: string;
  nr_inel: string;
  nume: string | null;
  sex: string;
  mutatii: string[];
  data_eclozare: Date | null;
  tata_id: string | null;
  mama_id: string | null;
  nivel: number;
}

export interface NodArbore {
  id: string;
  nrInel: string;
  nume: string | null;
  sex: string;
  mutatii: string[];
  dataEclozare: Date | null;
}

export interface NodStramos extends NodArbore {
  tata: NodStramos | null;
  mama: NodStramos | null;
}

export interface NodDescendent extends NodArbore {
  copii: NodDescendent[];
}

function randSpreNod(r: RandArbore): NodArbore {
  return {
    id: r.id,
    nrInel: r.nr_inel,
    nume: r.nume,
    sex: r.sex,
    mutatii: r.mutatii,
    dataEclozare: r.data_eclozare,
  };
}

function construiesteStramos(
  id: string | null,
  mapa: Map<string, RandArbore>,
): NodStramos | null {
  if (!id) return null;
  const rand = mapa.get(id);
  if (!rand) return null;

  return {
    ...randSpreNod(rand),
    tata: construiesteStramos(rand.tata_id, mapa),
    mama: construiesteStramos(rand.mama_id, mapa),
  };
}

function construiesteDescendenti(
  id: string,
  mapaCopii: Map<string, RandArbore[]>,
  vizitati: Set<string>,
): NodDescendent[] {
  const copii = mapaCopii.get(id) ?? [];
  const rezultat: NodDescendent[] = [];

  for (const copil of copii) {
    if (vizitati.has(copil.id)) continue;
    vizitati.add(copil.id);
    rezultat.push({
      ...randSpreNod(copil),
      copii: construiesteDescendenti(copil.id, mapaCopii, vizitati),
    });
  }

  return rezultat;
}
