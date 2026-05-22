import type { PublicUser } from '../common/types';
import { CartService } from './cart.service';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(user: PublicUser): Promise<import("./cart.service").CartResponse>;
    addItem(user: PublicUser, body: {
        bookId: string;
        quantity?: number;
    }): Promise<import("./cart.service").CartResponse>;
    updateItem(user: PublicUser, bookId: string, quantity: number): Promise<import("./cart.service").CartResponse>;
    removeItem(user: PublicUser, bookId: string): Promise<import("./cart.service").CartResponse>;
    clearCart(user: PublicUser): Promise<import("./cart.service").CartResponse>;
    merge(user: PublicUser, body: {
        items: {
            bookId: string;
            quantity: number;
        }[];
    }): Promise<import("./cart.service").CartResponse>;
}
