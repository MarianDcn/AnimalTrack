import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUserData, JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUserData> {
    const utilizator = await this.prisma.utilizator.findUnique({
      where: { id: payload.sub },
    });

    if (!utilizator) {
      throw new UnauthorizedException('Utilizator invalid');
    }

    return {
      id: utilizator.id,
      fermaId: utilizator.fermaId,
      email: utilizator.email,
      rol: utilizator.rol,
    };
  }
}
