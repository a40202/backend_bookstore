import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { mapBook } from '../common/mappers';
import type { Book } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';

export interface CartItemResponse {
  bookId: string;
  quantity: number;
  book: Book;
}

export interface CartResponse {
  id: string;
  userId: string;
  items: CartItemResponse[];
  itemCount: number;
  totalAmount: number;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }
    return cart;
  }

  private async buildResponse(cartId: string): Promise<CartResponse> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: { include: { book: true }, orderBy: { updatedAt: 'desc' } },
      },
    });
    if (!cart) throw new NotFoundException('Cart not found');

    const items: CartItemResponse[] = cart.items.map((i) => ({
      bookId: i.bookId,
      quantity: i.quantity,
      book: mapBook(i.book),
    }));

    const totalAmount = items.reduce(
      (sum, i) => sum + i.book.price * i.quantity,
      0,
    );
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      itemCount,
      totalAmount,
    };
  }

  async getCart(userId: string): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId);
    return this.buildResponse(cart.id);
  }

  async addItem(userId: string, bookId: string, quantity: number) {
    if (quantity < 1) throw new BadRequestException('So luong khong hop le');

    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Sach khong ton tai');
    if (book.stock < 1) throw new BadRequestException('Sach het hang');

    const cart = await this.getOrCreateCart(userId);
    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_bookId: { cartId: cart.id, bookId } },
    });

    const newQty = (existing?.quantity ?? 0) + quantity;
    if (newQty > book.stock) {
      throw new BadRequestException(
        `Chi con ${book.stock} cuon trong kho`,
      );
    }

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, bookId, quantity },
      });
    }

    return this.buildResponse(cart.id);
  }

  async updateItem(userId: string, bookId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    if (quantity <= 0) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id, bookId },
      });
      return this.buildResponse(cart.id);
    }

    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Sach khong ton tai');
    if (quantity > book.stock) {
      throw new BadRequestException(`Chi con ${book.stock} cuon trong kho`);
    }

    await this.prisma.cartItem.upsert({
      where: { cartId_bookId: { cartId: cart.id, bookId } },
      create: { cartId: cart.id, bookId, quantity },
      update: { quantity },
    });

    return this.buildResponse(cart.id);
  }

  async removeItem(userId: string, bookId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return this.getCart(userId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, bookId },
    });
    return this.buildResponse(cart.id);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return this.getCart(userId);
  }

  async mergeItems(
    userId: string,
    items: { bookId: string; quantity: number }[],
  ) {
    for (const item of items) {
      if (item.quantity > 0) {
        try {
          await this.addItem(userId, item.bookId, item.quantity);
        } catch {
          /* skip invalid items */
        }
      }
    }
    return this.getCart(userId);
  }
}
