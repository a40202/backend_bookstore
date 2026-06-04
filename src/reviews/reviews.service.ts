import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import type { Review } from '../common/types';
import { mapReview } from '../common/mappers';
import { PrismaService } from '../prisma/prisma.service';
import type { PublicUser } from '../common/types';
import { CreateReviewDto } from './dto/create-review.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByBook(bookId: string): Promise<Review[]> {
    const rows = await this.prisma.review.findMany({
      where: { bookId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapReview);
  }

  async create(user: PublicUser, dto: CreateReviewDto): Promise<Review> {
    if (!dto.bookId) throw new BadRequestException('bookId is required');
    if (!dto.comment?.trim()) throw new BadRequestException('comment is required');
    if (!Number.isInteger(dto.rating) || dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('rating must be an integer 1..5');
    }

    const book = await this.prisma.book.findUnique({ where: { id: dto.bookId } });
    if (!book) throw new BadRequestException('Book not found');

    const existing = await this.prisma.review.findFirst({
      where: { bookId: dto.bookId, userId: user.id },
    });
    if (existing) throw new ConflictException('Bạn đã đánh giá sách này rồi');

    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        bookId: dto.bookId,
        order: {
          userId: user.id,
          status: { in: ['delivered', 'shipping', 'confirmed'] },
        },
      },
    });
    if (!hasPurchased) {
      throw new BadRequestException('Bạn cần mua sách trước khi đánh giá');
    }

    const created = await this.prisma.review.create({
      data: {
        id: randomUUID(),
        bookId: dto.bookId,
        userId: user.id,
        userName: user.name ?? user.fullName,
        rating: dto.rating,
        comment: dto.comment.trim(),
      },
    });

    const agg = await this.prisma.review.aggregate({
      where: { bookId: dto.bookId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await this.prisma.book.update({
      where: { id: dto.bookId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count._all,
      },
    });

    return mapReview(created);
  }
}
