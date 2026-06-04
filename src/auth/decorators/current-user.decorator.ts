import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { PublicUser } from '../../common/types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PublicUser => {
    return ctx.switchToHttp().getRequest<{ user: PublicUser }>().user;
  },
);
