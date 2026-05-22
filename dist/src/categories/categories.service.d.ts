import type { Category } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private attachBookCounts;
    findAll(): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    create(dto: CreateCategoryDto): Promise<Category>;
    update(id: string, dto: UpdateCategoryDto): Promise<Category>;
    remove(id: string): Promise<void>;
}
