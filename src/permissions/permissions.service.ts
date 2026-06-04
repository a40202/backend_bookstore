import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import {
  DEFAULT_STAFF_PERMISSIONS,
  isPermissionKey,
  PERMISSION_KEYS,
  PERMISSION_LABELS,
  type PermissionKey,
} from '../common/permissions';
import type { PublicUser } from '../common/types';
import { mapUser } from '../common/mappers';
import { PrismaService } from '../prisma/prisma.service';

const CONFIG_ID = 'staff';

@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.ensureDefaultConfig();
  }

  getDefinitions() {
    return PERMISSION_KEYS.map((key) => ({
      key,
      label: PERMISSION_LABELS[key],
    }));
  }

  async getStaffPermissions(): Promise<PermissionKey[]> {
    try {
      const row = await this.prisma.staffRoleConfig.findUnique({
        where: { id: CONFIG_ID },
      });
      if (!row) return [...DEFAULT_STAFF_PERMISSIONS];
      return row.permissions.filter(isPermissionKey);
    } catch {
      return [...DEFAULT_STAFF_PERMISSIONS];
    }
  }

  async setStaffPermissions(permissions: string[]): Promise<PermissionKey[]> {
    const valid = permissions.filter(isPermissionKey);
    if (!valid.length) {
      throw new BadRequestException('Phải chọn ít nhất một quyền');
    }
    try {
      await this.prisma.staffRoleConfig.upsert({
        where: { id: CONFIG_ID },
        create: { id: CONFIG_ID, permissions: valid },
        update: { permissions: valid },
      });
    } catch {
      throw new BadRequestException(
        'Chua co bang phan quyen. Chay: npx prisma db push',
      );
    }
    return valid;
  }

  getAdminPermissions(): PermissionKey[] {
    return [...PERMISSION_KEYS];
  }

  async resolveForUser(user: {
    role: PublicUser['role'];
  }): Promise<PermissionKey[] | undefined> {
    if (user.role === 'admin') return this.getAdminPermissions();
    if (user.role === 'staff') return this.getStaffPermissions();
    return undefined;
  }

  async enrichUser<T extends PublicUser>(user: T): Promise<T> {
    const permissions = await this.resolveForUser(user);
    if (!permissions) return user;
    return { ...user, permissions };
  }

  async ensureDefaultConfig(): Promise<void> {
    try {
      const existing = await this.prisma.staffRoleConfig.findUnique({
        where: { id: CONFIG_ID },
      });
      if (!existing) {
        await this.prisma.staffRoleConfig.create({
          data: {
            id: CONFIG_ID,
            permissions: [...DEFAULT_STAFF_PERMISSIONS],
          },
        });
      }
    } catch (err) {
      console.warn(
        '[Permissions] StaffRoleConfig chua san sang — chay: npx prisma db push',
        err,
      );
    }
  }

  async enrichFromDb(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    return this.enrichUser(mapUser(user));
  }
}
