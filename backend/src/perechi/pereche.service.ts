import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SexPasare } from '../generated/prisma/enums';
import { CreatePerecheDto } from './dto/create-pereche.dto';
import { UpdatePerecheDto } from './dto/update-pereche.dto';

const PASARE_SELECT = {
  id: true,
  nrInel: true,
  nume: true,
  sex: true,
  mutatii: true,
  status: true,
} as const;

@Injectable()
export class PerecheService {
  constructor(private readonly prisma: PrismaService) {}

  async create(fermaId: string, dto: CreatePerecheDto) {
    if (dto.masculId === dto.femelaId) {
      throw new BadRequestException('Masculul si femela trebuie sa fie pasari diferite');
    }

    await this.verificaPasare(fermaId, dto.masculId, SexPasare.MASCUL);
    await this.verificaPasare(fermaId, dto.femelaId, SexPasare.FEMELA);

    return this.prisma.pereche.create({
      data: {
        fermaId,
        masculId: dto.masculId,
        femelaId: dto.femelaId,
        status: dto.status,
      },
      include: { mascul: { select: PASARE_SELECT }, femela: { select: PASARE_SELECT } },
    });
  }

  findAll(fermaId: string) {
    return this.prisma.pereche.findMany({
      where: { fermaId },
      include: { mascul: { select: PASARE_SELECT }, femela: { select: PASARE_SELECT } },
      orderBy: { dataCreare: 'desc' },
    });
  }

  async findOne(fermaId: string, id: string) {
    const pereche = await this.prisma.pereche.findFirst({
      where: { id, fermaId },
      include: { mascul: { select: PASARE_SELECT }, femela: { select: PASARE_SELECT } },
    });
    if (!pereche) {
      throw new NotFoundException('Perechea nu a fost gasita');
    }
    return pereche;
  }

  async update(fermaId: string, id: string, dto: UpdatePerecheDto) {
    const pereche = await this.findOne(fermaId, id);

    const masculId = dto.masculId ?? pereche.masculId;
    const femelaId = dto.femelaId ?? pereche.femelaId;
    if (masculId === femelaId) {
      throw new BadRequestException('Masculul si femela trebuie sa fie pasari diferite');
    }
    if (dto.masculId) await this.verificaPasare(fermaId, dto.masculId, SexPasare.MASCUL);
    if (dto.femelaId) await this.verificaPasare(fermaId, dto.femelaId, SexPasare.FEMELA);

    return this.prisma.pereche.update({
      where: { id },
      data: { masculId: dto.masculId, femelaId: dto.femelaId, status: dto.status },
      include: { mascul: { select: PASARE_SELECT }, femela: { select: PASARE_SELECT } },
    });
  }

  async remove(fermaId: string, id: string) {
    await this.findOne(fermaId, id);
    await this.prisma.pereche.delete({ where: { id } });
    return { success: true };
  }

  async findSerii(fermaId: string, id: string) {
    await this.findOne(fermaId, id);

    return this.prisma.serieCuibarit.findMany({
      where: { perecheId: id },
      include: {
        oua: { orderBy: { dataDepunere: 'asc' }, include: { pasare: true } },
      },
      orderBy: { dataCreare: 'asc' },
    });
  }

  private async verificaPasare(fermaId: string, pasareId: string, sexAsteptat: SexPasare) {
    const pasare = await this.prisma.pasare.findFirst({ where: { id: pasareId, fermaId } });
    if (!pasare) {
      throw new BadRequestException('Pasarea indicata nu exista in ferma ta');
    }
    if (pasare.sex !== sexAsteptat) {
      const eticheta = sexAsteptat === SexPasare.MASCUL ? 'mascul' : 'femela';
      throw new BadRequestException(`Pasarea ${pasare.nrInel} trebuie sa fie ${eticheta}`);
    }
  }
}
