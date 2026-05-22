import { Injectable, NotFoundException } from '@nestjs/common';
import type { Promotion } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';

function mapPromotion(p: {
  id: string;
  title: string;
  description: string;
  code: string | null;
  discountType: string;
  discountValue: number;
  minOrder: number | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: Date;
}): Promotion {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    code: p.code ?? undefined,
    discountType: p.discountType as Promotion['discountType'],
    discountValue: p.discountValue,
    minOrder: p.minOrder ?? undefined,
    startDate: p.startDate.toISOString().split('T')[0],
    endDate: p.endDate.toISOString().split('T')[0],
    isActive: p.isActive,
    imageUrl: p.imageUrl ?? undefined,
    createdAt: p.createdAt.toISOString().split('T')[0],
  };
}

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(): Promise<Promotion[]> {
    const now = new Date();
    const rows = await this.prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapPromotion);
  }

  async findAll(): Promise<Promotion[]> {
    const rows = await this.prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapPromotion);
  }

  async findOne(id: string): Promise<Promotion> {
    const row = await this.prisma.promotion.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Khuyen mai khong ton tai');
    return mapPromotion(row);
  }

  async create(data: Omit<Promotion, 'id' | 'createdAt'>): Promise<Promotion> {
    const row = await this.prisma.promotion.create({
      data: {
        title: data.title,
        description: data.description,
        code: data.code ?? null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrder: data.minOrder ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive,
        imageUrl: data.imageUrl ?? null,
      },
    });
    return mapPromotion(row);
  }

  async update(
    id: string,
    data: Partial<Omit<Promotion, 'id' | 'createdAt'>>,
  ): Promise<Promotion> {
    const row = await this.prisma.promotion.update({
      where: { id },
      data: {
        ...data,
        code: data.code === undefined ? undefined : data.code ?? null,
        minOrder: data.minOrder === undefined ? undefined : data.minOrder ?? null,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        imageUrl:
          data.imageUrl === undefined ? undefined : data.imageUrl ?? null,
      },
    });
    return mapPromotion(row);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.promotion.delete({ where: { id } });
  }
}
