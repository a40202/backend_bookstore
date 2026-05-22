import { Controller, Get, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findByBook(@Query('bookId') bookId: string) {
    return this.reviewsService.findByBook(bookId);
  }
}
