import { Injectable, NotFoundException } from '@nestjs/common';
import type { PublicUser } from '../common/types';
import { mapUser } from '../common/mappers';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PublicUser[]> {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map(mapUser);
  }

  async updateActive(id: string, isActive: boolean): Promise<PublicUser> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { isActive },
      });
      return mapUser(user);
    } catch {
      throw new NotFoundException(`User ${id} not found`);
    }
  }
}
