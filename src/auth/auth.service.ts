import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import type { AuthResponse, JwtPayload, PublicUser } from '../common/types';
import { mapUser } from '../common/mappers';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private signToken(user: { id: string; email: string; role: string }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN', '7d'),
    });
  }

  private toAuthResponse(user: Parameters<typeof mapUser>[0]): AuthResponse {
    const publicUser = mapUser(user);
    return {
      user: publicUser,
      accessToken: this.signToken(user),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Email hoac mat khau khong dung');
    }
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Email hoac mat khau khong dung');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Tai khoan da bi khoa');
    }
    return this.toAuthResponse(user);
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
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
        role: Role.customer,
      },
    });
    return this.toAuthResponse(user);
  }

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return mapUser(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<PublicUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        name: dto.fullName ?? undefined,
      },
    });
    return mapUser(user);
  }
}
