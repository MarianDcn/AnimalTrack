import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePreferinteDto } from './dto/update-preferinte.dto';

@Injectable()
export class PreferinteService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(utilizatorId: string) {
    const utilizator = await this.prisma.utilizator.findUniqueOrThrow({
      where: { id: utilizatorId },
      select: { preferinte: true },
    });
    return utilizator.preferinte ?? {};
  }

  async update(utilizatorId: string, dto: UpdatePreferinteDto) {
    const existent = await this.findOne(utilizatorId);
    const actualizate = { ...(existent as object), ...dto };

    await this.prisma.utilizator.update({
      where: { id: utilizatorId },
      data: { preferinte: actualizate as Prisma.InputJsonValue },
    });

    return actualizate;
  }
}
