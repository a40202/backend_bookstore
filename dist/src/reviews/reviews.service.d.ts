import type { Review } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
export declare class ReviewsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByBook(bookId: string): Promise<Review[]>;
}
