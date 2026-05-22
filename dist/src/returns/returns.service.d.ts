import { ReturnStatus } from '@prisma/client';
import type { PublicUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
export interface ReturnItemDetail {
    bookId: string;
    quantity: number;
    price: number;
    bookTitle?: string;
}
export type ReturnStatusType = 'pending' | 'approved' | 'rejected' | 'received' | 'refunded' | 'cancelled';
export interface ReturnRequestDetail {
    id: string;
    orderId: string;
    userId: string;
    status: ReturnStatusType;
    reason: string;
    description: string;
    adminNote?: string;
    refundAmount?: number;
    createdAt: string;
    updatedAt: string;
    items: ReturnItemDetail[];
    customerName?: string;
    customerEmail?: string;
}
export declare class ReturnsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private nextReturnId;
    private mapReturn;
    create(userId: string, dto: CreateReturnDto): Promise<ReturnRequestDetail>;
    findAll(user: PublicUser): Promise<ReturnRequestDetail[]>;
    findOne(id: string, user: PublicUser): Promise<ReturnRequestDetail>;
    updateStatus(id: string, status: ReturnStatus, adminNote?: string, refundAmount?: number): Promise<ReturnRequestDetail>;
}
