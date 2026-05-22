import { Injectable, NotFoundException } from '@nestjs/common';
import type { Article } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';

function mapArticle(a: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  authorName: string;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): Article {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
    coverImage: a.coverImage ?? undefined,
    authorName: a.authorName,
    isPublished: a.isPublished,
    publishedAt: a.publishedAt?.toISOString().split('T')[0],
    createdAt: a.createdAt.toISOString().split('T')[0],
    updatedAt: a.updatedAt.toISOString().split('T')[0],
  };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(): Promise<Article[]> {
    const rows = await this.prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });
    return rows.map(mapArticle);
  }

  async findBySlug(slug: string): Promise<Article> {
    const row = await this.prisma.article.findFirst({
      where: { slug, isPublished: true },
    });
    if (!row) throw new NotFoundException('Bai viet khong ton tai');
    return mapArticle(row);
  }

  async findAll(): Promise<Article[]> {
    const rows = await this.prisma.article.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(mapArticle);
  }

  async findOne(id: string): Promise<Article> {
    const row = await this.prisma.article.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Bai viet khong ton tai');
    return mapArticle(row);
  }

  async create(
    data: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'slug'> & {
      slug?: string;
    },
  ): Promise<Article> {
    let slug = data.slug ?? slugify(data.title);
    const existing = await this.prisma.article.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const row = await this.prisma.article.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage ?? null,
        authorName: data.authorName,
        isPublished: data.isPublished,
        publishedAt:
          data.isPublished && data.publishedAt
            ? new Date(data.publishedAt)
            : data.isPublished
              ? new Date()
              : null,
      },
    });
    return mapArticle(row);
  }

  async update(
    id: string,
    data: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Article> {
    const current = await this.prisma.article.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Bai viet khong ton tai');

    const isPublished = data.isPublished ?? current.isPublished;
    let publishedAt = current.publishedAt;
    if (data.publishedAt) publishedAt = new Date(data.publishedAt);
    else if (isPublished && !current.publishedAt) publishedAt = new Date();

    const row = await this.prisma.article.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage:
          data.coverImage === undefined ? undefined : data.coverImage ?? null,
        authorName: data.authorName,
        isPublished,
        publishedAt,
      },
    });
    return mapArticle(row);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.article.delete({ where: { id } });
  }
}
