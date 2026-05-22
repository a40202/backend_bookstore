import { Controller, Get, Param, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { QueryBooksDto } from './dto/query-books.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(@Query() query: QueryBooksDto) {
    return this.booksService.findAll(query);
  }

  @Get('featured')
  findFeatured() {
    return this.booksService.findFeatured();
  }

  @Get('new-arrivals')
  findNewArrivals() {
    return this.booksService.findNewArrivals();
  }

  @Get('best-sellers')
  findBestSellers() {
    return this.booksService.findBestSellers();
  }

  @Get('filters/meta')
  getFiltersMeta() {
    return this.booksService.getFiltersMeta();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }
}
