import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { PermissionKey } from '../../common/permissions';
import type { PublicUser } from '../../common/types';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionKey[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) return true;

    const { user } = context.switchToHttp().getRequest<{ user: PublicUser }>();
    if (!user) {
      throw new ForbiddenException('Không có quyền truy cập');
    }
    if (user.role === 'admin') return true;

    const granted = user.permissions ?? [];
    const missing = required.filter((p) => !granted.includes(p));
    if (missing.length) {
      throw new ForbiddenException('Không có quyền thực hiện thao tác này');
    }
    return true;
  }
}
