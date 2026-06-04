import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { InventoryLog } from '../common/types';
import { mapInventoryLog } from '../common/mappers';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  private async nextLogId(): Promise<string> {
    const logs = await this.prisma.inventoryLog.findMany({
      select: { id: true },
      orderBy: { createdAt: 'desc' },
    });
    const maxId = logs.reduce((max, log) => {
      const num = parseInt(log.id.replace(/^log-?/, ''), 10) || Number(log.id) || 0;
      return Math.max(max, num);
    }, 0);
    return `log-${maxId + 1}`;
  }

  async findAllLogs(): Promise<InventoryLog[]> {
    const logs = await this.prisma.inventoryLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const bookIds = [...new Set(logs.map((l) => l.bookId))];
    const books = await this.prisma.book.findMany({
      where: { id: { in: bookIds } },
      select: { id: true, title: true },
    });
    const titleMap = new Map(books.map((b) => [b.id, b.title]));

    return logs.map((log) =>
      mapInventoryLog(log, titleMap.get(log.bookId)),
    );
  }

  async adjustStock(
    dto: AdjustStockDto,
    createdBy: string,
  ): Promise<InventoryLog> {
    if (dto.quantity <= 0) {
      throw new BadRequestException('So luong phai lon hon 0');
    }

    const book = await this.prisma.book.findUnique({
      where: { id: dto.bookId },
    });
    if (!book) {
      throw new NotFoundException(`Book ${dto.bookId} not found`);
    }

    if (dto.type === 'export' && dto.quantity > book.stock) {
      throw new BadRequestException('So luong xuat vuot qua ton kho');
    }

    const newStock =
      dto.type === 'import'
        ? book.stock + dto.quantity
        : book.stock - dto.quantity;

    const logId = await this.nextLogId();
    const note =
      dto.note?.trim() ||
      (dto.type === 'import' ? 'Nhap kho' : 'Xuat kho');

    const [, log] = await this.prisma.$transaction([
      this.prisma.book.update({
        where: { id: dto.bookId },
        data: { stock: newStock },
      }),
      this.prisma.inventoryLog.create({
        data: {
          id: logId,
          bookId: dto.bookId,
          type: dto.type,
          quantity: dto.quantity,
          note,
          createdBy,
        },
      }),
    ]);

    return mapInventoryLog(log, book.title);
  }
}
