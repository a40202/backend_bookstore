"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const mappers_1 = require("../common/mappers");
const prisma_service_1 = require("../prisma/prisma.service");
const cart_service_1 = require("../cart/cart.service");
const invoices_service_1 = require("../invoices/invoices.service");
let OrdersService = class OrdersService {
    prisma;
    invoicesService;
    cartService;
    constructor(prisma, invoicesService, cartService) {
        this.prisma = prisma;
        this.invoicesService = invoicesService;
        this.cartService = cartService;
    }
    async nextOrderId() {
        const orders = await this.prisma.order.findMany({
            select: { id: true },
        });
        const nums = orders
            .map((o) => Number(o.id.replace('ORD', '')) || 0)
            .filter((n) => !Number.isNaN(n));
        const next = (nums.length ? Math.max(...nums) : 0) + 1;
        return `ORD${String(next).padStart(3, '0')}`;
    }
    async findAll(user, userId) {
        const isStaff = user.role === 'admin' || user.role === 'staff';
        const where = isStaff && userId
            ? { userId }
            : isStaff
                ? {}
                : { userId: user.id };
        const rows = await this.prisma.order.findMany({
            where,
            include: {
                items: true,
                user: {
                    select: { fullName: true, name: true, email: true, phone: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map(mappers_1.mapOrder);
    }
    async findOne(id, user) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException(`Order ${id} not found`);
        const isStaff = user.role === 'admin' || user.role === 'staff';
        if (!isStaff && order.userId !== user.id) {
            throw new common_1.ForbiddenException('Khong co quyen xem don hang nay');
        }
        return (0, mappers_1.mapOrder)(order);
    }
    async create(userId, dto) {
        const orderItems = [];
        for (const item of dto.items) {
            const book = await this.prisma.book.findUnique({
                where: { id: item.bookId },
            });
            if (!book) {
                throw new common_1.BadRequestException(`Book ${item.bookId} not found`);
            }
            if (book.stock < item.quantity) {
                throw new common_1.BadRequestException(`Book "${book.title}" het hang`);
            }
            orderItems.push({
                bookId: item.bookId,
                quantity: item.quantity,
                price: book.price,
            });
        }
        const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const shippingFee = dto.shippingFee ?? (subtotal >= 300000 ? 0 : 30000);
        const totalAmount = subtotal + shippingFee;
        const orderId = await this.nextOrderId();
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const order = await this.prisma.$transaction(async (tx) => {
            for (const item of orderItems) {
                await tx.book.update({
                    where: { id: item.bookId },
                    data: { stock: { decrement: item.quantity } },
                });
            }
            const created = await tx.order.create({
                data: {
                    id: orderId,
                    userId,
                    totalAmount,
                    shippingAddress: dto.shippingAddress,
                    phone: dto.phone,
                    paymentMethod: dto.paymentMethod,
                    status: client_1.OrderStatus.pending,
                    items: {
                        create: orderItems,
                    },
                },
                include: { items: true },
            });
            await this.invoicesService.createForOrder(created.id, userId, {
                subtotal,
                shippingFee,
                totalAmount,
                paymentMethod: dto.paymentMethod,
                buyerName: dto.buyerName || user.fullName,
                buyerEmail: dto.buyerEmail || user.email,
                buyerPhone: dto.phone,
                buyerAddress: dto.shippingAddress,
                note: dto.note,
            }, tx);
            return created;
        });
        await this.cartService.clearCart(userId);
        return (0, mappers_1.mapOrder)(order);
    }
    async cancelByCustomer(id, user) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException(`Order ${id} not found`);
        if (order.userId !== user.id) {
            throw new common_1.ForbiddenException('Khong co quyen huy don hang nay');
        }
        if (order.status !== client_1.OrderStatus.pending) {
            throw new common_1.BadRequestException('Chi huy duoc don hang dang cho xac nhan');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                await tx.book.update({
                    where: { id: item.bookId },
                    data: { stock: { increment: item.quantity } },
                });
            }
            return tx.order.update({
                where: { id },
                data: { status: client_1.OrderStatus.cancelled },
                include: { items: true },
            });
        });
        return (0, mappers_1.mapOrder)(updated);
    }
    async updateStatus(id, status, user) {
        if (user.role !== 'admin' && user.role !== 'staff') {
            throw new common_1.ForbiddenException('Chi admin/staff moi cap nhat trang thai');
        }
        const existing = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!existing)
            throw new common_1.NotFoundException(`Order ${id} not found`);
        const newStatus = status;
        const shouldRestoreStock = newStatus === client_1.OrderStatus.cancelled &&
            existing.status !== client_1.OrderStatus.cancelled;
        const order = await this.prisma.$transaction(async (tx) => {
            if (shouldRestoreStock) {
                for (const item of existing.items) {
                    await tx.book.update({
                        where: { id: item.bookId },
                        data: { stock: { increment: item.quantity } },
                    });
                }
            }
            return tx.order.update({
                where: { id },
                data: { status: newStatus },
                include: { items: true },
            });
        });
        return (0, mappers_1.mapOrder)(order);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        invoices_service_1.InvoicesService,
        cart_service_1.CartService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map