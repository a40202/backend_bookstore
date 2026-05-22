export declare class CreateOrderItemDto {
    bookId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    items: CreateOrderItemDto[];
    shippingAddress: string;
    phone: string;
    paymentMethod: 'cash' | 'transfer';
    shippingFee?: number;
    buyerName?: string;
    buyerEmail?: string;
    note?: string;
}
