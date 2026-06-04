import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import type { PublicUser } from '../common/types';
import { mapUser } from '../common/mappers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PublicUser[]> {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map(mapUser);
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('Email da ton tai');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const users = await this.prisma.user.findMany({ select: { id: true } });
    const maxId = users.reduce(
      (max, u) => Math.max(max, Number(u.id) || 0),
      0,
    );

    const user = await this.prisma.user.create({
      data: {
        id: String(maxId + 1),
        email: dto.email,
        password: hashed,
        fullName: dto.fullName,
        name: dto.fullName,
        phone: dto.phone,
        address: dto.address,
        role: dto.role === 'staff' ? Role.staff : Role.customer,
      },
    });
    return mapUser(user);
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

  async updateRole(
    id: string,
    role: 'customer' | 'admin' | 'staff',
  ): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    if (user.role === Role.admin && role !== 'admin') {
      const adminCount = await this.prisma.user.count({
        where: { role: Role.admin, isActive: true },
      });
      if (adminCount <= 1) {
        throw new BadRequestException(
          'Khong the doi vai tro admin cuoi cung',
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: role as Role },
    });
    return mapUser(updated);
  }
}
