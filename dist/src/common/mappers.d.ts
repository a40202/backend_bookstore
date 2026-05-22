import type { Book as PrismaBook, Order as PrismaOrder, User } from '@prisma/client';
import type { Book, Order, PublicUser, Review } from './types';
type OrderWithItems = PrismaOrder & {
    items: {
        bookId: string;
        quantity: number;
        price: number;
    }[];
    user?: {
        fullName: string;
        name: string | null;
        email: string;
        phone: string;
    };
};
export declare function mapBook(book: PrismaBook): Book;
export declare function mapUser(user: User): PublicUser;
export declare function mapOrder(order: OrderWithItems): Order;
export declare function mapReview(r: {
    id: string;
    bookId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
}): Review;
export {};
