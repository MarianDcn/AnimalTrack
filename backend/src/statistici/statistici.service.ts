import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface RandPuiPeAn {
  an: number;
  total: bigint;
}

@Injectable()
export class StatisticiService {
  constructor(private readonly prisma: PrismaService) {}

  async pasariPeMutatie(fermaId: string) {
    const rezultat = await this.prisma.pasare.groupBy({
      by: ['mutatie'],
      where: { fermaId },
      _count: { _all: true },
    });

    return rezultat
      .map((r) => ({ mutatie: r.mutatie ?? 'Necunoscuta', total: r._count._all }))
      .sort((a, b) => b.total - a.total);
  }

  async puiPeAn(fermaId: string) {
    const randuri = await this.prisma.$queryRaw<RandPuiPeAn[]>`
      SELECT EXTRACT(YEAR FROM data_eclozare)::int AS an, COUNT(*) AS total
      FROM pasari
      WHERE ferma_id = ${fermaId} AND data_eclozare IS NOT NULL
      GROUP BY an
      ORDER BY an;
    `;

    return randuri.map((r) => ({ an: r.an, total: Number(r.total) }));
  }

  async productiePerPereche(fermaId: string, an?: number) {
    const perechi = await this.prisma.pereche.findMany({
      where: { fermaId },
      include: {
        mascul: { select: { nrInel: true } },
        femela: { select: { nrInel: true } },
      },
    });

    const grupat = await this.prisma.pasare.groupBy({
      by: ['tataId', 'mamaId'],
      where: {
        fermaId,
        tataId: { not: null },
        mamaId: { not: null },
        ...(an ? { dataEclozare: { gte: new Date(`${an}-01-01`), lt: new Date(`${an + 1}-01-01`) } } : {}),
      },
      _count: { _all: true },
    });

    return perechi
      .map((p) => {
        const gasit = grupat.find((g) => g.tataId === p.masculId && g.mamaId === p.femelaId);
        return {
          perecheId: p.id,
          mascul: p.mascul.nrInel,
          femela: p.femela.nrInel,
          total: gasit?._count._all ?? 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }

  async productiePerMascul(fermaId: string, an?: number) {
    return this.productiePerParinte(fermaId, 'tataId', an);
  }

  async productiePerFemela(fermaId: string, an?: number) {
    return this.productiePerParinte(fermaId, 'mamaId', an);
  }

  private async productiePerParinte(fermaId: string, camp: 'tataId' | 'mamaId', an?: number) {
    const grupat = await this.prisma.pasare.groupBy({
      by: [camp],
      where: {
        fermaId,
        [camp]: { not: null },
        ...(an ? { dataEclozare: { gte: new Date(`${an}-01-01`), lt: new Date(`${an + 1}-01-01`) } } : {}),
      },
      _count: { _all: true },
    });

    const idParinti = grupat.map((g) => g[camp]).filter((id): id is string => Boolean(id));
    const parinti = await this.prisma.pasare.findMany({
      where: { id: { in: idParinti } },
      select: { id: true, nrInel: true },
    });
    const mapaParinti = new Map(parinti.map((p) => [p.id, p.nrInel]));

    return grupat
      .map((g) => ({
        id: g[camp] as string,
        nrInel: mapaParinti.get(g[camp] as string) ?? '?',
        total: g._count._all,
      }))
      .sort((a, b) => b.total - a.total);
  }
}
