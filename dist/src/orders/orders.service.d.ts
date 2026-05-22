import type { Order, OrderStatus as OrderStatusType, PublicUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private readonly prisma;
    private readonly invoicesService;
    private readonly cartService;
    constructor(prisma: PrismaService, invoicesService: InvoicesService, cartService: CartService);
    private nextOrderId;
    findAll(user: PublicUser, userId?: string): Promise<Order[]>;
    findOne(id: string, user: PublicUser): Promise<Order>;
    create(userId: string, dto: CreateOrderDto): Promise<Order>;
    cancelByCustomer(id: string, user: PublicUser): Promise<Order>;
    updateStatus(id: string, status: OrderStatusType, user: PublicUser): Promise<Order>;
}
