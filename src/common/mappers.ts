import type { Book as PrismaBook, Order as PrismaOrder, User } from '@prisma/client';
import type { Book, Order, PublicUser, Review } from './types';

type OrderWithItems = PrismaOrder & {
  items: { bookId: string; quantity: number; price: number }[];
  user?: { fullName: string; name: string | null; email: string; phone: string };
};

export function mapBook(book: PrismaBook): Book {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    price: book.price,
    originalPrice: book.originalPrice ?? undefined,
    description: book.description,
    coverImage: book.coverImage,
    category: book.category,
    categoryId: book.categoryId ?? undefined,
    publisher: book.publisher,
    publishYear: book.publishYear,
    pages: book.pages,
    language: book.language,
    isbn: book.isbn,
    stock: book.stock,
    soldCount: book.soldCount ?? undefined,
    rating: book.rating,
    reviewCount: book.reviewCount,
    isFeatured: book.isFeatured,
    isNewArrival: book.isNewArrival,
    isBestSeller: book.isBestSeller,
  };
}

export function mapUser(user: User): PublicUser {
  const { password: _, ...publicUser } = user;
  return {
    id: publicUser.id,
    email: publicUser.email,
    fullName: publicUser.fullName,
    name: publicUser.name ?? undefined,
    phone: publicUser.phone,
    address: publicUser.address,
    role: publicUser.role as PublicUser['role'],
    avatar: publicUser.avatar ?? undefined,
    isActive: publicUser.isActive,
    createdAt: user.createdAt.toISOString().split('T')[0],
  };
}

export function mapOrder(order: OrderWithItems): Order {
  return {
    id: order.id,
    userId: order.userId,
    items: order.items.map((i) => ({
      bookId: i.bookId,
      quantity: i.quantity,
      price: i.price,
    })),
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
    phone: order.phone,
    paymentMethod: order.paymentMethod as Order['paymentMethod'],
    status: order.status as Order['status'],
    createdAt: order.createdAt.toISOString().split('T')[0],
    updatedAt: order.updatedAt.toISOString().split('T')[0],
    customerName: order.user?.name ?? order.user?.fullName,
    customerEmail: order.user?.email,
    customerPhone: order.user?.phone,
  };
}

export function mapReview(r: {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}): Review {
  return {
    id: r.id,
    bookId: r.bookId,
    userId: r.userId,
    userName: r.userName,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString().split('T')[0],
  };
}

export function mapInventoryLog(
  log: {
    id: string;
    bookId: string;
    type: string;
    quantity: number;
    note: string;
    createdAt: Date;
    createdBy: string;
  },
  bookTitle?: string,
) {
  return {
    id: log.id,
    bookId: log.bookId,
    type: log.type as 'import' | 'export',
    quantity: log.quantity,
    note: log.note,
    createdAt: log.createdAt.toISOString(),
    createdBy: log.createdBy,
    bookTitle,
  };
}

export function mapSupportTicket(ticket: {
  id: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  orderId: string | null;
  response: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: ticket.id,
    customerId: ticket.customerId ?? undefined,
    customerName: ticket.customerName,
    customerEmail: ticket.customerEmail,
    customerPhone: ticket.customerPhone ?? undefined,
    subject: ticket.subject,
    message: ticket.message,
    status: ticket.status as 'open' | 'in_progress' | 'resolved',
    priority: ticket.priority as 'low' | 'medium' | 'high',
    orderId: ticket.orderId ?? undefined,
    response: ticket.response ?? undefined,
    createdAt: ticket.createdAt.toISOString().split('T')[0],
    updatedAt: ticket.updatedAt.toISOString().split('T')[0],
  };
}
