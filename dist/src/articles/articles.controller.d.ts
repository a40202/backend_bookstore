import type { Article } from '../common/types';
import { ArticlesService } from './articles.service';
export declare class ArticlesController {
    private readonly articlesService;
    constructor(articlesService: ArticlesService);
    findPublished(): Promise<Article[]>;
    findBySlug(slug: string): Promise<Article>;
    findAll(): Promise<Article[]>;
    findOne(id: string): Promise<Article>;
    create(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article>;
    update(id: string, data: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Article>;
    remove(id: string): Promise<void>;
}
