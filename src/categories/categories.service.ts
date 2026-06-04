import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Category } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private async attachBookCounts(
    categories: { id: string; name: string; slug: string; description: string; bookCount: number }[],
  ): Promise<Category[]> {
    const books = await this.prisma.book.findMany({
      select: { categoryId: true, category: true },
    });

    return categories.map((cat) => {
      const count = books.filter(
        (b) => b.categoryId === cat.id || b.category === cat.name,
      ).length;
      return { ...cat, bookCount: count };
    });
  }

  async findAll(): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({ orderBy: { id: 'asc' } });
    return this.attachBookCounts(rows);
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    const [withCount] = await this.attachBookCounts([category]);
    return withCount;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = dto.slug?.trim() || slugify(dto.name);
    const exists = await this.prisma.category.findUnique({ where: { slug } });
    if (exists) throw new ConflictException('Slug da ton tai');

    const cats = await this.prisma.category.findMany({ select: { id: true } });
    const maxId = cats.reduce((m, c) => Math.max(m, Number(c.id) || 0), 0);

    const created = await this.prisma.category.create({
      data: {
        id: String(maxId + 1),
        name: dto.name,
        slug,
        description: dto.description,
        bookCount: 0,
      },
    });
    const [withCount] = await this.attachBookCounts([created]);
    return withCount;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    if (dto.slug) {
      const dup = await this.prisma.category.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (dup) throw new ConflictException('Slug da ton tai');
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: dto,
    });

    if (dto.name) {
      await this.prisma.book.updateMany({
        where: { categoryId: id },
        data: { category: dto.name },
      });
    }

    const [withCount] = await this.attachBookCounts([updated]);
    return withCount;
  }

  async remove(id: string): Promise<void> {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    const bookCount = await this.prisma.book.count({
      where: { OR: [{ categoryId: id }, { category: cat.name }] },
    });
    if (bookCount > 0) {
      throw new ConflictException(
        `Khong the xoa: con ${bookCount} sach trong danh muc`,
      );
    }
    await this.prisma.category.delete({ where: { id } });
  }
}
