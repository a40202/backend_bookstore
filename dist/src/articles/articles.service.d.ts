import type { Article } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
export declare class ArticlesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findPublished(): Promise<Article[]>;
    findBySlug(slug: string): Promise<Article>;
    findAll(): Promise<Article[]>;
    findOne(id: string): Promise<Article>;
    create(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'slug'> & {
        slug?: string;
    }): Promise<Article>;
    update(id: string, data: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Article>;
    remove(id: string): Promise<void>;
}
