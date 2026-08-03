import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserData } from '../types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
