import { Injectable } from '@nestjs/common';
import type { Review } from '../common/types';
import { mapReview } from '../common/mappers';
import { PrismaService } from '../prisma/prisma.service';

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
}
