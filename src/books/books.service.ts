import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { Book } from '../common/types';
import { mapBook } from '../common/mappers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  /** Số sách tối đa cho block trang chủ / danh sách theo loại */
  private readonly SECTION_LIMIT = 20;

  private readonly inStockWhere: Prisma.BookWhereInput = { stock: { gt: 0 } };

  private mergeSectionBooks(
    primary: Book[],
    secondary: Book[],
    limit: number,
  ): Book[] {
    const seen = new Set<string>();
    const result: Book[] = [];
    for (const book of [...primary, ...secondary]) {
      if (seen.has(book.id)) continue;
      seen.add(book.id);
      result.push(book);
      if (result.length >= limit) break;
    }
    return result;
  }

  private async salesRankedBookIds(limit: number): Promise<string[]> {
    const groups = await this.prisma.orderItem.groupBy({
      by: ['bookId'],
      _sum: { quantity: true },
      where: {
        order: {
          status: { in: ['delivered', 'shipping', 'confirmed'] },
        },
      },
    });
    return groups
      .sort((a, b) => (b._sum.quantity ?? 0) - (a._sum.quantity ?? 0))
      .slice(0, limit)
      .map((g) => g.bookId);
  }

  private sortBooks(books: Book[], sortBy?: string): Book[] {
    const copy = [...books];
    switch (sortBy) {
      case 'price-asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return copy.sort((a, b) => b.price - a.price);
      case 'rating':
        return copy.sort((a, b) => b.rating - a.rating);
      case 'bestseller':
        return copy.sort((a, b) => b.reviewCount - a.reviewCount);
      case 'newest':
        return copy.sort(
          (a, b) =>
            b.publishYear - a.publishYear ||
            (Number(b.id) || 0) - (Number(a.id) || 0),
        );
      default:
        return copy;
    }
  }

  private async sectionContextWhere(
    query: QueryBooksDto,
  ): Promise<Prisma.BookWhereInput> {
    const parts: Prisma.BookWhereInput[] = [this.inStockWhere];
    if (query.category) {
      parts.push(await this.categoryWhere(query.category));
    }
    if (query.author) {
      parts.push({ author: { equals: query.author, mode: 'insensitive' } });
    }
    if (query.publisher) {
      parts.push({
        publisher: { equals: query.publisher, mode: 'insensitive' },
      });
    }
    return parts.length === 1 ? parts[0] : { AND: parts };
  }

  private filterBooksBySearch(books: Book[], search: string): Book[] {
    const q = search.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q),
    );
  }

  private filterBooksByPrice(
    books: Book[],
    minPrice?: number,
    maxPrice?: number,
  ): Book[] {
    return books.filter((b) => {
      if (minPrice != null && b.price < minPrice) return false;
      if (maxPrice != null && b.price > maxPrice) return false;
      return true;
    });
  }

  private async findFeaturedBooks(
    baseWhere: Prisma.BookWhereInput,
    limit = this.SECTION_LIMIT,
  ): Promise<Book[]> {
    const flagged = await this.prisma.book.findMany({
      where: { ...baseWhere, isFeatured: true },
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    });
    const fallback = await this.prisma.book.findMany({
      where: {
        ...baseWhere,
        rating: { gte: 4 },
        reviewCount: { gt: 0 },
      },
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      take: limit * 2,
    });
    return this.mergeSectionBooks(
      flagged.map(mapBook),
      fallback.map(mapBook),
      limit,
    );
  }

  private async findNewArrivalBooks(
    baseWhere: Prisma.BookWhereInput,
    limit = this.SECTION_LIMIT,
  ): Promise<Book[]> {
    const recentYear = new Date().getFullYear() - 1;
    const flagged = await this.prisma.book.findMany({
      where: { ...baseWhere, isNewArrival: true },
      orderBy: [{ publishYear: 'desc' }, { id: 'desc' }],
    });
    const fallback = await this.prisma.book.findMany({
      where: {
        ...baseWhere,
        publishYear: { gte: recentYear },
      },
      orderBy: [{ publishYear: 'desc' }, { id: 'desc' }],
      take: limit * 2,
    });
    return this.mergeSectionBooks(
      flagged.map(mapBook),
      fallback.map(mapBook),
      limit,
    );
  }

  private async findBestSellerBooks(
    baseWhere: Prisma.BookWhereInput,
    limit = this.SECTION_LIMIT,
  ): Promise<Book[]> {
    const flagged = await this.prisma.book.findMany({
      where: { ...baseWhere, isBestSeller: true },
      orderBy: [{ reviewCount: 'desc' }, { rating: 'desc' }],
    });

    const salesIds = await this.salesRankedBookIds(limit * 2);
    let fromSales: Book[] = [];
    if (salesIds.length > 0) {
      const rows = await this.prisma.book.findMany({
        where: { ...baseWhere, id: { in: salesIds } },
      });
      const byId = new Map(rows.map((r) => [r.id, r]));
      fromSales = salesIds
        .map((id) => byId.get(id))
        .filter((r): r is NonNullable<typeof r> => r != null)
        .map(mapBook);
    }

    const fallback = await this.prisma.book.findMany({
      where: baseWhere,
      orderBy: [
        { soldCount: 'desc' },
        { reviewCount: 'desc' },
        { rating: 'desc' },
      ],
      take: limit * 2,
    });

    return this.mergeSectionBooks(
      flagged.map(mapBook),
      [...fromSales, ...fallback.map(mapBook)],
      limit,
    );
  }

  private async categoryWhere(
    categoryParam: string,
  ): Promise<Prisma.BookWhereInput> {
    const cat = await this.prisma.category.findFirst({
      where: {
        OR: [{ slug: categoryParam }, { id: categoryParam }],
      },
    });
    if (cat) {
      return {
        OR: [
          { categoryId: cat.id },
          { category: { equals: cat.name, mode: 'insensitive' } },
        ],
      };
    }
    const nameGuess = categoryParam.replace(/-/g, ' ');
    return {
      category: { contains: nameGuess, mode: 'insensitive' },
    };
  }

  private async buildWhere(query: QueryBooksDto): Promise<Prisma.BookWhereInput> {
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
      const categoryFilter = await this.categoryWhere(query.category);
      if (where.OR) {
        where.AND = [{ OR: where.OR }, categoryFilter];
        delete where.OR;
      } else {
        Object.assign(where, categoryFilter);
      }
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

    return where;
  }

  private buildOrderBy(
    sortBy?: string,
  ):
    | Prisma.BookOrderByWithRelationInput
    | Prisma.BookOrderByWithRelationInput[]
    | undefined {
    switch (sortBy) {
      case 'newest':
        return [{ publishYear: 'desc' }, { id: 'desc' }];
      case 'price-asc':
        return { price: 'asc' };
      case 'price-desc':
        return { price: 'desc' };
      case 'rating':
        return { rating: 'desc' };
      case 'bestseller':
        return [{ reviewCount: 'desc' }, { rating: 'desc' }];
      default:
        return { id: 'asc' };
    }
  }

  async findAll(query: QueryBooksDto): Promise<Book[]> {
    if (query.filter) {
      const baseWhere = await this.sectionContextWhere(query);
      let books: Book[];
      switch (query.filter) {
        case 'featured':
          books = await this.findFeaturedBooks(baseWhere, 100);
          break;
        case 'new':
          books = await this.findNewArrivalBooks(baseWhere, 100);
          break;
        case 'bestseller':
          books = await this.findBestSellerBooks(baseWhere, 100);
          break;
        default:
          books = [];
      }
      if (query.search) {
        books = this.filterBooksBySearch(books, query.search);
      }
      books = this.filterBooksByPrice(books, query.minPrice, query.maxPrice);
      return this.sortBooks(books, query.sortBy);
    }

    const rows = await this.prisma.book.findMany({
      where: await this.buildWhere(query),
      orderBy: this.buildOrderBy(query.sortBy),
    });
    return rows.map(mapBook);
  }

  async findFeatured(): Promise<Book[]> {
    return this.findFeaturedBooks(this.inStockWhere);
  }

  async findNewArrivals(): Promise<Book[]> {
    return this.findNewArrivalBooks(this.inStockWhere);
  }

  async findBestSellers(): Promise<Book[]> {
    return this.findBestSellerBooks(this.inStockWhere);
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

  private async nextBookId(): Promise<string> {
    const books = await this.prisma.book.findMany({ select: { id: true } });
    const maxId = books.reduce((max, b) => Math.max(max, Number(b.id) || 0), 0);
    return String(maxId + 1);
  }

  async create(dto: CreateBookDto): Promise<Book> {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category ${dto.categoryId} not found`);
    }

    const isbnExists = await this.prisma.book.findFirst({
      where: { isbn: dto.isbn },
    });
    if (isbnExists) {
      throw new ConflictException('ISBN da ton tai');
    }

    const publishYear = dto.publishYear ?? new Date().getFullYear();
    const currentYear = new Date().getFullYear();

    const created = await this.prisma.book.create({
      data: {
        id: await this.nextBookId(),
        title: dto.title,
        author: dto.author,
        price: dto.price,
        originalPrice: dto.originalPrice,
        description: dto.description ?? '',
        coverImage:
          dto.coverImage ?? '/placeholder.svg?height=400&width=300',
        category: category.name,
        categoryId: dto.categoryId,
        publisher: dto.publisher ?? '',
        publishYear,
        pages: dto.pages ?? 0,
        language: dto.language ?? 'Tieng Viet',
        isbn: dto.isbn,
        stock: dto.stock ?? 0,
        isFeatured: dto.isFeatured ?? false,
        isNewArrival:
          dto.isNewArrival ?? publishYear >= currentYear - 1,
        isBestSeller: dto.isBestSeller ?? false,
      },
    });
    return mapBook(created);
  }

  async update(id: string, dto: UpdateBookDto): Promise<Book> {
    const existing = await this.prisma.book.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Book ${id} not found`);

    if (dto.isbn && dto.isbn !== existing.isbn) {
      const isbnExists = await this.prisma.book.findFirst({
        where: { isbn: dto.isbn, NOT: { id } },
      });
      if (isbnExists) {
        throw new ConflictException('ISBN da ton tai');
      }
    }

    let categoryName = existing.category;
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category ${dto.categoryId} not found`);
      }
      categoryName = category.name;
    }

    const updated = await this.prisma.book.update({
      where: { id },
      data: {
        ...dto,
        category: dto.categoryId ? categoryName : undefined,
      },
    });
    return mapBook(updated);
  }

  async remove(id: string): Promise<void> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException(`Không tìm thấy sách ${id}`);

    const orderCount = await this.prisma.orderItem.count({
      where: { bookId: id },
    });
    if (orderCount > 0) {
      throw new ConflictException(
        'Không thể xóa sách đã có trong đơn hàng. Chỉ có thể ẩn hoặc đặt tồn kho = 0.',
      );
    }

    await this.prisma.$transaction([
      this.prisma.cartItem.deleteMany({ where: { bookId: id } }),
      this.prisma.review.deleteMany({ where: { bookId: id } }),
      this.prisma.inventoryLog.deleteMany({ where: { bookId: id } }),
      this.prisma.book.delete({ where: { id } }),
    ]);
  }
}
