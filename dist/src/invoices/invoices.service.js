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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let InvoicesService = class InvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async nextInvoiceId() {
        const rows = await this.prisma.invoice.findMany({ select: { id: true } });
        const nums = rows
            .map((r) => Number(r.id.replace('INV', '')) || 0)
            .filter((n) => !Number.isNaN(n));
        const next = (nums.length ? Math.max(...nums) : 0) + 1;
        return `INV${String(next).padStart(4, '0')}`;
    }
    mapInvoice(inv) {
        const items = inv.order?.items.map((i) => ({
            bookId: i.bookId,
            bookTitle: i.book.title,
            quantity: i.quantity,
            unitPrice: i.price,
            lineTotal: i.price * i.quantity,
        })) ?? [];
        return {
            id: inv.id,
            orderId: inv.orderId,
            userId: inv.userId,
            subtotal: inv.subtotal,
            shippingFee: inv.shippingFee,
            discount: inv.discount,
            totalAmount: inv.totalAmount,
            paymentMethod: inv.paymentMethod,
            paymentStatus: inv.paymentStatus,
            buyerName: inv.buyerName,
            buyerEmail: inv.buyerEmail,
            buyerPhone: inv.buyerPhone,
            buyerAddress: inv.buyerAddress,
            note: inv.note ?? undefined,
            issuedAt: inv.issuedAt.toISOString(),
            paidAt: inv.paidAt?.toISOString(),
            items,
            orderStatus: inv.order?.status,
        };
    }
    async createForOrder(orderId, userId, data, db = this.prisma) {
        const existing = await db.invoice.findMany({ select: { id: true } });
        const nums = existing
            .map((r) => Number(r.id.replace('INV', '')) || 0)
            .filter((n) => !Number.isNaN(n));
        const id = `INV${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, '0')}`;
        return db.invoice.create({
            data: {
                id,
                orderId,
                userId,
                subtotal: data.subtotal,
                shippingFee: data.shippingFee,
                discount: 0,
                totalAmount: data.totalAmount,
                paymentMethod: data.paymentMethod,
                paymentStatus: data.paymentMethod === client_1.PaymentMethod.transfer
                    ? client_1.PaymentStatus.unpaid
                    : client_1.PaymentStatus.paid,
                buyerName: data.buyerName,
                buyerEmail: data.buyerEmail,
                buyerPhone: data.buyerPhone,
                buyerAddress: data.buyerAddress,
                note: data.note ?? null,
                paidAt: data.paymentMethod === client_1.PaymentMethod.cash ? new Date() : null,
            },
        });
    }
    async findByOrder(orderId, user) {
        const inv = await this.prisma.invoice.findUnique({
            where: { orderId },
            include: {
                order: {
                    include: {
                        items: { include: { book: { select: { title: true } } } },
                    },
                },
            },
        });
        if (!inv)
            throw new common_1.NotFoundException('Hoa don khong ton tai');
        const isStaff = user.role === 'admin' || user.role === 'staff';
        if (!isStaff && inv.userId !== user.id) {
            throw new common_1.ForbiddenException('Khong co quyen xem hoa don');
        }
        return this.mapInvoice(inv);
    }
    async findById(id, user) {
        const inv = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        items: { include: { book: { select: { title: true } } } },
                    },
                },
            },
        });
        if (!inv)
            throw new common_1.NotFoundException('Hoa don khong ton tai');
        const isStaff = user.role === 'admin' || user.role === 'staff';
        if (!isStaff && inv.userId !== user.id) {
            throw new common_1.ForbiddenException('Khong co quyen xem hoa don');
        }
        return this.mapInvoice(inv);
    }
    async findAllForUser(userId) {
        const rows = await this.prisma.invoice.findMany({
            where: { userId },
            include: {
                order: {
                    include: {
                        items: { include: { book: { select: { title: true } } } },
                    },
                },
            },
            orderBy: { issuedAt: 'desc' },
        });
        return rows.map((r) => this.mapInvoice(r));
    }
    async findAllAdmin() {
        const rows = await this.prisma.invoice.findMany({
            include: {
                order: {
                    include: {
                        items: { include: { book: { select: { title: true } } } },
                    },
                },
            },
            orderBy: { issuedAt: 'desc' },
        });
        return rows.map((r) => this.mapInvoice(r));
    }
    async updatePaymentStatus(id, status) {
        const inv = await this.prisma.invoice.update({
            where: { id },
            data: {
                paymentStatus: status,
                paidAt: status === client_1.PaymentStatus.paid ? new Date() : null,
            },
            include: {
                order: {
                    include: {
                        items: { include: { book: { select: { title: true } } } },
                    },
                },
            },
        });
        return this.mapInvoice(inv);
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map