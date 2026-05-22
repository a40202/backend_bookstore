import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import type { Order, OrderStatus as OrderStatusType, PublicUser } from '../common/types';
import { mapOrder } from '../common/mappers';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoicesService: InvoicesService,
    private readonly cartService: CartService,
  ) {}

  private async nextOrderId(): Promise<string> {
    const orders = await this.prisma.order.findMany({
      select: { id: true },
    });
    const nums = orders
      .map((o) => Number(o.id.replace('ORD', '')) || 0)
      .filter((n) => !Number.isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return `ORD${String(next).padStart(3, '0')}`;
  }

  async findAll(user: PublicUser, userId?: string): Promise<Order[]> {
    const isStaff = user.role === 'admin' || user.role === 'staff';
    const where =
      isStaff && userId
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
    return rows.map(mapOrder);
  }

  async findOne(id: string, user: PublicUser): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    const isStaff = user.role === 'admin' || user.role === 'staff';
    if (!isStaff && order.userId !== user.id) {
      throw new ForbiddenException('Khong co quyen xem don hang nay');
    }
    return mapOrder(order);
  }

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    const orderItems: { bookId: string; quantity: number; price: number }[] =
      [];

    for (const item of dto.items) {
      const book = await this.prisma.book.findUnique({
        where: { id: item.bookId },
      });
      if (!book) {
        throw new BadRequestException(`Book ${item.bookId} not found`);
      }
      if (book.stock < item.quantity) {
        throw new BadRequestException(`Book "${book.title}" het hang`);
      }
      orderItems.push({
        bookId: item.bookId,
        quantity: item.quantity,
        price: book.price,
      });
    }

    const subtotal = orderItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );
    const shippingFee = dto.shippingFee ?? (subtotal >= 300000 ? 0 : 30000);
    const totalAmount = subtotal + shippingFee;
    const orderId = await this.nextOrderId();
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

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
          paymentMethod: dto.paymentMethod as PaymentMethod,
          status: OrderStatus.pending,
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });

      await this.invoicesService.createForOrder(
        created.id,
        userId,
        {
          subtotal,
          shippingFee,
          totalAmount,
          paymentMethod: dto.paymentMethod as PaymentMethod,
          buyerName: dto.buyerName || user.fullName,
          buyerEmail: dto.buyerEmail || user.email,
          buyerPhone: dto.phone,
          buyerAddress: dto.shippingAddress,
          note: dto.note,
        },
        tx as unknown as PrismaService,
      );

      return created;
    });

    await this.cartService.clearCart(userId);

    return mapOrder(order);
  }

  async cancelByCustomer(id: string, user: PublicUser): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    if (order.userId !== user.id) {
      throw new ForbiddenException('Khong co quyen huy don hang nay');
    }
    if (order.status !== OrderStatus.pending) {
      throw new BadRequestException(
        'Chi huy duoc don hang dang cho xac nhan',
      );
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
        data: { status: OrderStatus.cancelled },
        include: { items: true },
      });
    });

    return mapOrder(updated);
  }

  async updateStatus(
    id: string,
    status: OrderStatusType,
    user: PublicUser,
  ): Promise<Order> {
    if (user.role !== 'admin' && user.role !== 'staff') {
      throw new ForbiddenException('Chi admin/staff moi cap nhat trang thai');
    }

    const existing = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) throw new NotFoundException(`Order ${id} not found`);

    const newStatus = status as OrderStatus;
    const shouldRestoreStock =
      newStatus === OrderStatus.cancelled &&
      existing.status !== OrderStatus.cancelled;

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

    return mapOrder(order);
  }
}
