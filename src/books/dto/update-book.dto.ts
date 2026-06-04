export class UpdateBookDto {
  title?: string;
  author?: string;
  price?: number;
  originalPrice?: number;
  description?: string;
  coverImage?: string;
  categoryId?: string;
  publisher?: string;
  publishYear?: number;
  pages?: number;
  language?: string;
  isbn?: string;
  stock?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}
