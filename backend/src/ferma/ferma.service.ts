import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFermaDto } from './dto/update-ferma.dto';

@Injectable()
export class FermaService {
  constructor(private readonly prisma: PrismaService) {}

  update(fermaId: string, dto: UpdateFermaDto) {
    return this.prisma.ferma.update({
      where: { id: fermaId },
      data: { nume: dto.nume },
      select: { id: true, nume: true },
    });
  }
}
