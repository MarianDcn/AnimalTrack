import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSerieDto } from './dto/create-serie.dto';
import { UpdateSerieDto } from './dto/update-serie.dto';

@Injectable()
export class SeriiService {
  constructor(private readonly prisma: PrismaService) {}

  async create(fermaId: string, dto: CreateSerieDto) {
    const pereche = await this.prisma.pereche.findFirst({
      where: { id: dto.perecheId, fermaId },
    });
    if (!pereche) {
      throw new NotFoundException('Perechea nu a fost gasita');
    }

    return this.prisma.serieCuibarit.create({
      data: { perecheId: dto.perecheId, dataImperechere: dto.dataImperechere },
      include: { oua: true },
    });
  }

  async findOne(fermaId: string, id: string) {
    const serie = await this.prisma.serieCuibarit.findFirst({
      where: { id, pereche: { fermaId } },
      include: {
        oua: { orderBy: { dataDepunere: 'asc' }, include: { pasare: true } },
        pereche: true,
      },
    });
    if (!serie) {
      throw new NotFoundException('Seria de cuibarit nu a fost gasita');
    }
    return serie;
  }

  async update(fermaId: string, id: string, dto: UpdateSerieDto) {
    await this.gasesteSauEsueaza(fermaId, id);

    return this.prisma.serieCuibarit.update({
      where: { id },
      data: dto,
      include: { oua: { orderBy: { dataDepunere: 'asc' }, include: { pasare: true } } },
    });
  }

  async remove(fermaId: string, id: string) {
    await this.gasesteSauEsueaza(fermaId, id);
    await this.prisma.serieCuibarit.delete({ where: { id } });
    return { success: true };
  }

  private async gasesteSauEsueaza(fermaId: string, id: string) {
    const serie = await this.prisma.serieCuibarit.findFirst({
      where: { id, pereche: { fermaId } },
    });
    if (!serie) {
      throw new NotFoundException('Seria de cuibarit nu a fost gasita');
    }
    return serie;
  }
}
