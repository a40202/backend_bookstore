import type { Book } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
export interface CartItemResponse {
    bookId: string;
    quantity: number;
    book: Book;
}
export interface CartResponse {
    id: string;
    userId: string;
    items: CartItemResponse[];
    itemCount: number;
    totalAmount: number;
}
export declare class CartService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getOrCreateCart;
    private buildResponse;
    getCart(userId: string): Promise<CartResponse>;
    addItem(userId: string, bookId: string, quantity: number): Promise<CartResponse>;
    updateItem(userId: string, bookId: string, quantity: number): Promise<CartResponse>;
    removeItem(userId: string, bookId: string): Promise<CartResponse>;
    clearCart(userId: string): Promise<CartResponse>;
    mergeItems(userId: string, items: {
        bookId: string;
        quantity: number;
    }[]): Promise<CartResponse>;
}
