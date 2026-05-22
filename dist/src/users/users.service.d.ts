import type { PublicUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<PublicUser[]>;
    updateActive(id: string, isActive: boolean): Promise<PublicUser>;
}
