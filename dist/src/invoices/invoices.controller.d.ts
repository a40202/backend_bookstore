import { PaymentStatus } from '@prisma/client';
import type { PublicUser } from '../common/types';
import { InvoicesService } from './invoices.service';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findAll(user: PublicUser): Promise<import("./invoices.service").InvoiceDetail[]>;
    findByOrder(orderId: string, user: PublicUser): Promise<import("./invoices.service").InvoiceDetail>;
    findOne(id: string, user: PublicUser): Promise<import("./invoices.service").InvoiceDetail>;
    updatePayment(id: string, status: PaymentStatus): Promise<import("./invoices.service").InvoiceDetail>;
}
