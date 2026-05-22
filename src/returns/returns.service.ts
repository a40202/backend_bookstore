import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, ReturnReason, ReturnStatus } from '@prisma/client';
import type { PublicUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';

export interface ReturnItemDetail {
  bookId: string;
  quantity: number;
  price: number;
  bookTitle?: string;
}

export type ReturnStatusType =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'received'
  | 'refunded'
  | 'cancelled';

export interface ReturnRequestDetail {
  id: string;
  orderId: string;
  userId: string;
  status: ReturnStatusType;
  reason: string;
  description: string;
  adminNote?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
  items: ReturnItemDetail[];
  customerName?: string;
  customerEmail?: string;
}

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  private async nextReturnId(): Promise<string> {
    const rows = await this.prisma.returnRequest.findMany({
      select: { id: true },
    });
    const nums = rows
      .map((r) => Number(r.id.replace('RET', '')) || 0)
      .filter((n) => !Number.isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return `RET${String(next).padStart(4, '0')}`;
  }

  private mapReturn(r: {
    id: string;
    orderId: string;
    userId: string;
    status: ReturnStatus;
    reason: ReturnReason;
    description: string;
    adminNote: string | null;
    refundAmount: number | null;
    createdAt: Date;
    updatedAt: Date;
    items: { bookId: string; quantity: number; price: number }[];
    user?: { fullName: string; name: string | null; email: string };
    order?: { items: { bookId: string; book: { title: string } }[] };
  }): ReturnRequestDetail {
    const bookTitleMap = new Map(
      r.order?.items.map((i) => [i.bookId, i.book.title]) ?? [],
    );
    return {
      id: r.id,
      orderId: r.orderId,
      userId: r.userId,
      status: r.status as ReturnStatusType,
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

  async create(userId: string, dto: CreateReturnDto): Promise<ReturnRequestDetail> {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Don hang khong ton tai');
    if (order.userId !== userId) {
      throw new ForbiddenException('Khong co quyen tra hang don nay');
    }
    if (order.status !== OrderStatus.delivered) {
      throw new BadRequestException(
        'Chi tra hang khi don da giao thanh cong',
      );
    }

    const existingPending = await this.prisma.returnRequest.findFirst({
      where: {
        orderId: dto.orderId,
        status: { in: [ReturnStatus.pending, ReturnStatus.approved, ReturnStatus.received] },
      },
    });
    if (existingPending) {
      throw new BadRequestException('Don hang da co yeu cau tra hang dang xu ly');
    }

    const returnItems: { bookId: string; quantity: number; price: number }[] =
      [];
    let refundTotal = 0;

    for (const item of dto.items) {
      const orderItem = order.items.find((oi) => oi.bookId === item.bookId);
      if (!orderItem) {
        throw new BadRequestException(`Sach ${item.bookId} khong co trong don`);
      }
      if (item.quantity < 1 || item.quantity > orderItem.quantity) {
        throw new BadRequestException(
          `So luong tra khong hop le cho sach ${item.bookId}`,
        );
      }
      returnItems.push({
        bookId: item.bookId,
        quantity: item.quantity,
        price: orderItem.price,
      });
      refundTotal += orderItem.price * item.quantity;
    }

    if (returnItems.length === 0) {
      throw new BadRequestException('Chon it nhat mot san pham tra hang');
    }

    const created = await this.prisma.returnRequest.create({
      data: {
        id: await this.nextReturnId(),
        orderId: dto.orderId,
        userId,
        reason: dto.reason as ReturnReason,
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

  async findAll(user: PublicUser): Promise<ReturnRequestDetail[]> {
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

  async findOne(id: string, user: PublicUser): Promise<ReturnRequestDetail> {
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
    if (!row) throw new NotFoundException('Yeu cau tra hang khong ton tai');

    const isStaff = user.role === 'admin' || user.role === 'staff';
    if (!isStaff && row.userId !== user.id) {
      throw new ForbiddenException('Khong co quyen xem');
    }
    return this.mapReturn(row);
  }

  async updateStatus(
    id: string,
    status: ReturnStatus,
    adminNote?: string,
    refundAmount?: number,
  ): Promise<ReturnRequestDetail> {
    const data: {
      status: ReturnStatus;
      adminNote?: string;
      refundAmount?: number;
    } = { status };
    if (adminNote !== undefined) data.adminNote = adminNote;
    if (refundAmount !== undefined) data.refundAmount = refundAmount;

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
}
