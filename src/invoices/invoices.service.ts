import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  private async nextInvoiceId(): Promise<string> {
    const rows = await this.prisma.invoice.findMany({ select: { id: true } });
    const nums = rows
      .map((r) => Number(r.id.replace('INV', '')) || 0)
      .filter((n) => !Number.isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return `INV${String(next).padStart(4, '0')}`;
  }

  private mapInvoice(
    inv: {
      id: string;
      orderId: string;
      userId: string;
      subtotal: number;
      shippingFee: number;
      discount: number;
      totalAmount: number;
      paymentMethod: PaymentMethod;
      paymentStatus: PaymentStatus;
      buyerName: string;
      buyerEmail: string;
      buyerPhone: string;
      buyerAddress: string;
      note: string | null;
      issuedAt: Date;
      paidAt: Date | null;
      order?: {
        status: string;
        items: {
          bookId: string;
          quantity: number;
          price: number;
          book: { title: string };
        }[];
      };
    },
  ): InvoiceDetail {
    const items: InvoiceItem[] =
      inv.order?.items.map((i) => ({
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
      paymentMethod: inv.paymentMethod as InvoiceDetail['paymentMethod'],
      paymentStatus: inv.paymentStatus as InvoiceDetail['paymentStatus'],
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

  async createForOrder(
    orderId: string,
    userId: string,
    data: {
      subtotal: number;
      shippingFee: number;
      totalAmount: number;
      paymentMethod: PaymentMethod;
      buyerName: string;
      buyerEmail: string;
      buyerPhone: string;
      buyerAddress: string;
      note?: string;
    },
    db: PrismaService | Prisma.TransactionClient = this.prisma,
  ) {
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
        paymentStatus:
          data.paymentMethod === PaymentMethod.transfer
            ? PaymentStatus.unpaid
            : PaymentStatus.paid,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerPhone: data.buyerPhone,
        buyerAddress: data.buyerAddress,
        note: data.note ?? null,
        paidAt:
          data.paymentMethod === PaymentMethod.cash ? new Date() : null,
      },
    });
  }

  async findByOrder(orderId: string, user: PublicUser): Promise<InvoiceDetail> {
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
    if (!inv) throw new NotFoundException('Hoa don khong ton tai');

    const isStaff = user.role === 'admin' || user.role === 'staff';
    if (!isStaff && inv.userId !== user.id) {
      throw new ForbiddenException('Khong co quyen xem hoa don');
    }
    return this.mapInvoice(inv);
  }

  async findById(id: string, user: PublicUser): Promise<InvoiceDetail> {
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
    if (!inv) throw new NotFoundException('Hoa don khong ton tai');

    const isStaff = user.role === 'admin' || user.role === 'staff';
    if (!isStaff && inv.userId !== user.id) {
      throw new ForbiddenException('Khong co quyen xem hoa don');
    }
    return this.mapInvoice(inv);
  }

  async findAllForUser(userId: string): Promise<InvoiceDetail[]> {
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

  async findAllAdmin(): Promise<InvoiceDetail[]> {
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

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<InvoiceDetail> {
    const inv = await this.prisma.invoice.update({
      where: { id },
      data: {
        paymentStatus: status,
        paidAt: status === PaymentStatus.paid ? new Date() : null,
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
}
