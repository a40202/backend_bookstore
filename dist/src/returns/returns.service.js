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
exports.ReturnsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let ReturnsService = class ReturnsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async nextReturnId() {
        const rows = await this.prisma.returnRequest.findMany({
            select: { id: true },
        });
        const nums = rows
            .map((r) => Number(r.id.replace('RET', '')) || 0)
            .filter((n) => !Number.isNaN(n));
        const next = (nums.length ? Math.max(...nums) : 0) + 1;
        return `RET${String(next).padStart(4, '0')}`;
    }
    mapReturn(r) {
        const bookTitleMap = new Map(r.order?.items.map((i) => [i.bookId, i.book.title]) ?? []);
        return {
            id: r.id,
            orderId: r.orderId,
            userId: r.userId,
            status: r.status,
            reason: r.reason,
            description: r.description,
            adminNote: r.adminNote ?? undefined,
            refundAmount: r.refundAmount ?? undefined,
            createdAt: r.createdAt.toISOString().split('T')[0],
            updatedAt: r.updatedAt.toISOString().split('T')[0],
            items: r.items.map((i) => ({
                bookId: i.bookId,
                quantity: i.quantity,
                price: i.price,
                bookTitle: bookTitleMap.get(i.bookId),
            })),
            customerName: r.user?.name ?? r.user?.fullName,
            customerEmail: r.user?.email,
        };
    }
    async create(userId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Don hang khong ton tai');
        if (order.userId !== userId) {
            throw new common_1.ForbiddenException('Khong co quyen tra hang don nay');
        }
        if (order.status !== client_1.OrderStatus.delivered) {
            throw new common_1.BadRequestException('Chi tra hang khi don da giao thanh cong');
        }
        const existingPending = await this.prisma.returnRequest.findFirst({
            where: {
                orderId: dto.orderId,
                status: { in: [client_1.ReturnStatus.pending, client_1.ReturnStatus.approved, client_1.ReturnStatus.received] },
            },
        });
        if (existingPending) {
            throw new common_1.BadRequestException('Don hang da co yeu cau tra hang dang xu ly');
        }
        const returnItems = [];
        let refundTotal = 0;
        for (const item of dto.items) {
            const orderItem = order.items.find((oi) => oi.bookId === item.bookId);
            if (!orderItem) {
                throw new common_1.BadRequestException(`Sach ${item.bookId} khong co trong don`);
            }
            if (item.quantity < 1 || item.quantity > orderItem.quantity) {
                throw new common_1.BadRequestException(`So luong tra khong hop le cho sach ${item.bookId}`);
            }
            returnItems.push({
                bookId: item.bookId,
                quantity: item.quantity,
                price: orderItem.price,
            });
            refundTotal += orderItem.price * item.quantity;
        }
        if (returnItems.length === 0) {
            throw new common_1.BadRequestException('Chon it nhat mot san pham tra hang');
        }
        const created = await this.prisma.returnRequest.create({
            data: {
                id: await this.nextReturnId(),
                orderId: dto.orderId,
                userId,
                reason: dto.reason,
                description: dto.description,
                refundAmount: refundTotal,
                items: { create: returnItems },
            },
            include: {
                items: true,
                user: { select: { fullName: true, name: true, email: true } },
                order: {
                    include: {
                        items: { include: { book: { select: { title: true } } } },
                    },
                },
            },
        });
        return this.mapReturn(created);
    }
    async findAll(user) {
        const isStaff = user.role === 'admin' || user.role === 'staff';
        const rows = await this.prisma.returnRequest.findMany({
            where: isStaff ? {} : { userId: user.id },
            include: {
                items: true,
                user: { select: { fullName: true, name: true, email: true } },
                order: {
                    include: {
                        items: { include: { book: { select: { title: true } } } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((r) => this.mapReturn(r));
    }
    async findOne(id, user) {
        const row = await this.prisma.returnRequest.findUnique({
            where: { id },
            include: {
                items: true,
                user: { select: { fullName: true, name: true, email: true } },
                order: {
                    include: {
                        items: { include: { book: { select: { title: true } } } },
                    },
                },
            },
        });
        if (!row)
            throw new common_1.NotFoundException('Yeu cau tra hang khong ton tai');
        const isStaff = user.role === 'admin' || user.role === 'staff';
        if (!isStaff && row.userId !== user.id) {
            throw new common_1.ForbiddenException('Khong co quyen xem');
        }
        return this.mapReturn(row);
    }
    async updateStatus(id, status, adminNote, refundAmount) {
        const data = { status };
        if (adminNote !== undefined)
            data.adminNote = adminNote;
        if (refundAmount !== undefined)
            data.refundAmount = refundAmount;
        const updated = await this.prisma.returnRequest.update({
            where: { id },
            data,
            include: {
                items: true,
                user: { select: { fullName: true, name: true, email: true } },
                order: {
                    include: {
                        items: { include: { book: { select: { title: true } } } },
                    },
                },
            },
        });
        return this.mapReturn(updated);
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map