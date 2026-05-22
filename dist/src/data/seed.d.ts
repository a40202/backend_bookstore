import type { Book, Category, Order, Review } from '../common/types';
interface SeedUser {
    id: string;
    email: string;
    password: string;
    fullName: string;
    name?: string;
    phone: string;
    address: string;
    role: 'customer' | 'admin' | 'staff';
    isActive?: boolean;
    createdAt: string;
}
interface InventoryLog {
    id: string;
    bookId: string;
    type: 'import' | 'export';
    quantity: number;
    note: string;
    createdAt: string;
    createdBy: string;
}
export declare const seedCategories: Category[];
export declare const seedBooks: Book[];
export declare const seedUsers: SeedUser[];
export declare const seedOrders: Order[];
export declare const seedReviews: Review[];
export declare const seedInventoryLogs: InventoryLog[];
export {};
