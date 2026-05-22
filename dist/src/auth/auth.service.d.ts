import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AuthResponse, PublicUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    private signToken;
    private toAuthResponse;
    login(dto: LoginDto): Promise<AuthResponse>;
    register(dto: RegisterDto): Promise<AuthResponse>;
    getProfile(userId: string): Promise<PublicUser>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<PublicUser>;
}
