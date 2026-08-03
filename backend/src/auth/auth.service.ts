import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RolUtilizator } from '../../generated/prisma/enums';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.type';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existent = await this.prisma.utilizator.findUnique({
      where: { email: dto.email },
    });

    if (existent) {
      throw new ConflictException('Exista deja un utilizator cu acest email');
    }

    const parolaHash = await bcrypt.hash(dto.parola, SALT_ROUNDS);

    const { ferma, utilizator } = await this.prisma.$transaction(async (tx) => {
      const ferma = await tx.ferma.create({
        data: {
          nume: dto.fermaNume,
          adresa: dto.fermaAdresa,
        },
      });

      const utilizator = await tx.utilizator.create({
        data: {
          fermaId: ferma.id,
          email: dto.email,
          parolaHash,
          rol: RolUtilizator.ADMIN,
        },
      });

      return { ferma, utilizator };
    });

    return this.buildAuthResponse(utilizator.id, ferma.id, utilizator.email, utilizator.rol);
  }

  async login(dto: LoginDto) {
    const utilizator = await this.prisma.utilizator.findUnique({
      where: { email: dto.email },
    });

    if (!utilizator) {
      throw new UnauthorizedException('Email sau parola incorecte');
    }

    const parolaValida = await bcrypt.compare(dto.parola, utilizator.parolaHash);
    if (!parolaValida) {
      throw new UnauthorizedException('Email sau parola incorecte');
    }

    return this.buildAuthResponse(
      utilizator.id,
      utilizator.fermaId,
      utilizator.email,
      utilizator.rol,
    );
  }

  private buildAuthResponse(userId: string, fermaId: string, email: string, rol: string) {
    const payload: JwtPayload = { sub: userId, fermaId, email, rol };

    return {
      accessToken: this.jwtService.sign(payload),
      utilizator: { id: userId, fermaId, email, rol },
    };
  }
}
