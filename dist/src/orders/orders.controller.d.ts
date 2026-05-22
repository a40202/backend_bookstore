import type { OrderStatus, PublicUser } from '../common/types';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(user: PublicUser, userId?: string): Promise<import("../common/types").Order[]>;
    findOne(id: string, user: PublicUser): Promise<import("../common/types").Order>;
    create(user: PublicUser, dto: CreateOrderDto): Promise<import("../common/types").Order>;
    cancel(id: string, user: PublicUser): Promise<import("../common/types").Order>;
    updateStatus(id: string, status: OrderStatus, user: PublicUser): Promise<import("../common/types").Order>;
}
