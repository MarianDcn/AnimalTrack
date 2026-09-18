import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSugestieDto } from './dto/create-sugestie.dto';

@Injectable()
export class SugestiiService {
  constructor(private readonly prisma: PrismaService) {}

  create(fermaId: string, utilizatorId: string, dto: CreateSugestieDto) {
    return this.prisma.sugestie.create({
      data: { fermaId, utilizatorId, mesaj: dto.mesaj },
    });
  }

  findAll() {
    return this.prisma.sugestie.findMany({
      orderBy: { dataCreare: 'desc' },
      include: {
        ferma: { select: { nume: true } },
        utilizator: { select: { email: true } },
      },
    });
  }
}
