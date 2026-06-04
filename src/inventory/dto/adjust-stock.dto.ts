export class AdjustStockDto {
  bookId: string;
  type: 'import' | 'export';
  quantity: number;
  note?: string;
}
