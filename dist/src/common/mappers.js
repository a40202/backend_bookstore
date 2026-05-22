"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapBook = mapBook;
exports.mapUser = mapUser;
exports.mapOrder = mapOrder;
exports.mapReview = mapReview;
function mapBook(book) {
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
function mapUser(user) {
    const { password: _, ...publicUser } = user;
    return {
        id: publicUser.id,
        email: publicUser.email,
        fullName: publicUser.fullName,
        name: publicUser.name ?? undefined,
        phone: publicUser.phone,
        address: publicUser.address,
        role: publicUser.role,
        avatar: publicUser.avatar ?? undefined,
        isActive: publicUser.isActive,
        createdAt: user.createdAt.toISOString().split('T')[0],
    };
}
function mapOrder(order) {
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
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.createdAt.toISOString().split('T')[0],
        updatedAt: order.updatedAt.toISOString().split('T')[0],
        customerName: order.user?.name ?? order.user?.fullName,
        customerEmail: order.user?.email,
        customerPhone: order.user?.phone,
    };
}
function mapReview(r) {
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
//# sourceMappingURL=mappers.js.map