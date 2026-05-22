import type { Promotion } from '../common/types';
import { PromotionsService } from './promotions.service';
export declare class PromotionsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    findActive(): Promise<Promotion[]>;
    findAll(): Promise<Promotion[]>;
    findOne(id: string): Promise<Promotion>;
    create(data: Omit<Promotion, 'id' | 'createdAt'>): Promise<Promotion>;
    update(id: string, data: Partial<Omit<Promotion, 'id' | 'createdAt'>>): Promise<Promotion>;
    remove(id: string): Promise<void>;
}
