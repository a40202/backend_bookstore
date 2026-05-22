import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { Book } from '../common/types';
import { mapBook } from '../common/mappers';
import { PrismaService } from '../prisma/prisma.service';
import { QueryBooksDto } from './dto/query-books.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: QueryBooksDto): Prisma.BookWhereInput {
    const where: Prisma.BookWhereInput = {};

    if (query.search) {
      const q = query.search;
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { author: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.category = { contains: query.category, mode: 'insensitive' };
    }

    if (query.author) {
      where.author = { equals: query.author, mode: 'insensitive' };
    }

    if (query.publisher) {
      where.publisher = { equals: query.publisher, mode: 'insensitive' };
    }

    if (query.minPrice != null || query.maxPrice != null) {
      where.price = {};
      if (query.minPrice != null) where.price.gte = query.minPrice;
      if (query.maxPrice != null) where.price.lte = query.maxPrice;
    }

    if (query.filter === 'featured') where.isFeatured = true;
    else if (query.filter === 'new') where.isNewArrival = true;
    else if (query.filter === 'bestseller') where.isBestSeller = true;

    return where;
  }

  private buildOrderBy(
    sortBy?: string,
  ): Prisma.BookOrderByWithRelationInput | undefined {
    switch (sortBy) {
      case 'price-asc':
        return { price: 'asc' };
      case 'price-desc':
        return { price: 'desc' };
      case 'rating':
        return { rating: 'desc' };
      case 'bestseller':
        return { reviewCount: 'desc' };
      default:
        return { id: 'asc' };
    }
  }

  async findAll(query: QueryBooksDto): Promise<Book[]> {
    const rows = await this.prisma.book.findMany({
      where: this.buildWhere(query),
      orderBy: this.buildOrderBy(query.sortBy),
    });
    return rows.map(mapBook);
  }

  async findFeatured(): Promise<Book[]> {
    const rows = await this.prisma.book.findMany({ where: { isFeatured: true } });
    return rows.map(mapBook);
  }

  async findNewArrivals(): Promise<Book[]> {
    const rows = await this.prisma.book.findMany({
      where: { isNewArrival: true },
    });
    return rows.map(mapBook);
  }

  async findBestSellers(): Promise<Book[]> {
    const rows = await this.prisma.book.findMany({
      where: { isBestSeller: true },
    });
    return rows.map(mapBook);
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return mapBook(book);
  }

  async getFiltersMeta(): Promise<{ authors: string[]; publishers: string[] }> {
    const books = await this.prisma.book.findMany({
      select: { author: true, publisher: true },
    });
    const authors = [...new Set(books.map((b) => b.author))].sort();
    const publishers = [...new Set(books.map((b) => b.publisher))].sort();
    return { authors, publishers };
  }
}
