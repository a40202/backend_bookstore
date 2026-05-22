import type { Promotion } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
export declare class PromotionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findActive(): Promise<Promotion[]>;
    findAll(): Promise<Promotion[]>;
    findOne(id: string): Promise<Promotion>;
    create(data: Omit<Promotion, 'id' | 'createdAt'>): Promise<Promotion>;
    update(id: string, data: Partial<Omit<Promotion, 'id' | 'createdAt'>>): Promise<Promotion>;
    remove(id: string): Promise<void>;
}
