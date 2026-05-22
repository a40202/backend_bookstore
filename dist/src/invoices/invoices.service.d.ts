import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import type { PublicUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
export interface InvoiceItem {
    bookId: string;
    bookTitle: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}
export interface InvoiceDetail {
    id: string;
    orderId: string;
    userId: string;
    subtotal: number;
    shippingFee: number;
    discount: number;
    totalAmount: number;
    paymentMethod: 'cash' | 'transfer';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    buyerAddress: string;
    note?: string;
    issuedAt: string;
    paidAt?: string;
    items: InvoiceItem[];
    orderStatus?: string;
}
export declare class InvoicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private nextInvoiceId;
    private mapInvoice;
    createForOrder(orderId: string, userId: string, data: {
        subtotal: number;
        shippingFee: number;
        totalAmount: number;
        paymentMethod: PaymentMethod;
        buyerName: string;
        buyerEmail: string;
        buyerPhone: string;
        buyerAddress: string;
        note?: string;
    }, db?: PrismaService | Prisma.TransactionClient): Promise<{
        id: string;
        totalAmount: number;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        userId: string;
        subtotal: number;
        shippingFee: number;
        discount: number;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        buyerName: string;
        buyerEmail: string;
        buyerPhone: string;
        buyerAddress: string;
        note: string | null;
        issuedAt: Date;
        paidAt: Date | null;
        orderId: string;
    }>;
    findByOrder(orderId: string, user: PublicUser): Promise<InvoiceDetail>;
    findById(id: string, user: PublicUser): Promise<InvoiceDetail>;
    findAllForUser(userId: string): Promise<InvoiceDetail[]>;
    findAllAdmin(): Promise<InvoiceDetail[]>;
    updatePaymentStatus(id: string, status: PaymentStatus): Promise<InvoiceDetail>;
}
