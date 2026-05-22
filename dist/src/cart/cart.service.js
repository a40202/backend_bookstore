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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const mappers_1 = require("../common/mappers");
const prisma_service_1 = require("../prisma/prisma.service");
let CartService = class CartService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateCart(userId) {
        let cart = await this.prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await this.prisma.cart.create({ data: { userId } });
        }
        return cart;
    }
    async buildResponse(cartId) {
        const cart = await this.prisma.cart.findUnique({
            where: { id: cartId },
            include: {
                items: { include: { book: true }, orderBy: { updatedAt: 'desc' } },
            },
        });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const items = cart.items.map((i) => ({
            bookId: i.bookId,
            quantity: i.quantity,
            book: (0, mappers_1.mapBook)(i.book),
        }));
        const totalAmount = items.reduce((sum, i) => sum + i.book.price * i.quantity, 0);
        const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
        return {
            id: cart.id,
            userId: cart.userId,
            items,
            itemCount,
            totalAmount,
        };
    }
    async getCart(userId) {
        const cart = await this.getOrCreateCart(userId);
        return this.buildResponse(cart.id);
    }
    async addItem(userId, bookId, quantity) {
        if (quantity < 1)
            throw new common_1.BadRequestException('So luong khong hop le');
        const book = await this.prisma.book.findUnique({ where: { id: bookId } });
        if (!book)
            throw new common_1.NotFoundException('Sach khong ton tai');
        if (book.stock < 1)
            throw new common_1.BadRequestException('Sach het hang');
        const cart = await this.getOrCreateCart(userId);
        const existing = await this.prisma.cartItem.findUnique({
            where: { cartId_bookId: { cartId: cart.id, bookId } },
        });
        const newQty = (existing?.quantity ?? 0) + quantity;
        if (newQty > book.stock) {
            throw new common_1.BadRequestException(`Chi con ${book.stock} cuon trong kho`);
        }
        if (existing) {
            await this.prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: newQty },
            });
        }
        else {
            await this.prisma.cartItem.create({
                data: { cartId: cart.id, bookId, quantity },
            });
        }
        return this.buildResponse(cart.id);
    }
    async updateItem(userId, bookId, quantity) {
        const cart = await this.getOrCreateCart(userId);
        if (quantity <= 0) {
            await this.prisma.cartItem.deleteMany({
                where: { cartId: cart.id, bookId },
            });
            return this.buildResponse(cart.id);
        }
        const book = await this.prisma.book.findUnique({ where: { id: bookId } });
        if (!book)
            throw new common_1.NotFoundException('Sach khong ton tai');
        if (quantity > book.stock) {
            throw new common_1.BadRequestException(`Chi con ${book.stock} cuon trong kho`);
        }
        await this.prisma.cartItem.upsert({
            where: { cartId_bookId: { cartId: cart.id, bookId } },
            create: { cartId: cart.id, bookId, quantity },
            update: { quantity },
        });
        return this.buildResponse(cart.id);
    }
    async removeItem(userId, bookId) {
        const cart = await this.prisma.cart.findUnique({ where: { userId } });
        if (!cart)
            return this.getCart(userId);
        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id, bookId },
        });
        return this.buildResponse(cart.id);
    }
    async clearCart(userId) {
        const cart = await this.prisma.cart.findUnique({ where: { userId } });
        if (cart) {
            await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
        return this.getCart(userId);
    }
    async mergeItems(userId, items) {
        for (const item of items) {
            if (item.quantity > 0) {
                try {
                    await this.addItem(userId, item.bookId, item.quantity);
                }
                catch {
                }
            }
        }
        return this.getCart(userId);
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map