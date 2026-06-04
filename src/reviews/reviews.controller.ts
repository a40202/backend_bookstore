import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { PublicUser } from '../common/types';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findByBook(@Query('bookId') bookId: string) {
    return this.reviewsService.findByBook(bookId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  create(@CurrentUser() user: PublicUser, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user, dto);
  }
}
