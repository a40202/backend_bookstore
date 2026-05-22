import type { Book } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { QueryBooksDto } from './dto/query-books.dto';
export declare class BooksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private buildWhere;
    private buildOrderBy;
    findAll(query: QueryBooksDto): Promise<Book[]>;
    findFeatured(): Promise<Book[]>;
    findNewArrivals(): Promise<Book[]>;
    findBestSellers(): Promise<Book[]>;
    findOne(id: string): Promise<Book>;
    getFiltersMeta(): Promise<{
        authors: string[];
        publishers: string[];
    }>;
}
