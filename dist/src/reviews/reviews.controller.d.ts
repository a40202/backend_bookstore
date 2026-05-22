import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findByBook(bookId: string): Promise<import("../common/types").Review[]>;
}
