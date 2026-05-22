import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<import("../common/types").Category[]>;
    findOne(id: string): Promise<import("../common/types").Category>;
    create(dto: CreateCategoryDto): Promise<import("../common/types").Category>;
    update(id: string, dto: UpdateCategoryDto): Promise<import("../common/types").Category>;
    remove(id: string): Promise<void>;
}
