export declare class CreateReturnItemDto {
    bookId: string;
    quantity: number;
}
export declare class CreateReturnDto {
    orderId: string;
    reason: 'defective' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other';
    description: string;
    items: CreateReturnItemDto[];
}
