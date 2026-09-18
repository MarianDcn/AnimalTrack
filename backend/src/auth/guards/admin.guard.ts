import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CurrentUserData } from '../types/jwt-payload.type';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: CurrentUserData }>();
    const adminEmail = this.config.get<string>('ADMIN_EMAIL');

    if (!adminEmail || request.user.email !== adminEmail) {
      throw new ForbiddenException('Nu ai acces la aceasta resursa');
    }

    return true;
  }
}
