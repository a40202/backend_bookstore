export class QueryBooksDto {
  search?: string;
  category?: string;
  author?: string;
  publisher?: string;
  filter?: 'featured' | 'new' | 'bestseller';
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'bestseller';
  minPrice?: number;
  maxPrice?: number;
}
