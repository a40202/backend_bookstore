"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksService = void 0;
const common_1 = require("@nestjs/common");
const mappers_1 = require("../common/mappers");
const prisma_service_1 = require("../prisma/prisma.service");
let BooksService = class BooksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildWhere(query) {
        const where = {};
        if (query.search) {
            const q = query.search;
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { author: { contains: q, mode: 'insensitive' } },
                { category: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (query.category) {
            where.category = { contains: query.category, mode: 'insensitive' };
        }
        if (query.author) {
            where.author = { equals: query.author, mode: 'insensitive' };
        }
        if (query.publisher) {
            where.publisher = { equals: query.publisher, mode: 'insensitive' };
        }
        if (query.minPrice != null || query.maxPrice != null) {
            where.price = {};
            if (query.minPrice != null)
                where.price.gte = query.minPrice;
            if (query.maxPrice != null)
                where.price.lte = query.maxPrice;
        }
        if (query.filter === 'featured')
            where.isFeatured = true;
        else if (query.filter === 'new')
            where.isNewArrival = true;
        else if (query.filter === 'bestseller')
            where.isBestSeller = true;
        return where;
    }
    buildOrderBy(sortBy) {
        switch (sortBy) {
            case 'price-asc':
                return { price: 'asc' };
            case 'price-desc':
                return { price: 'desc' };
            case 'rating':
                return { rating: 'desc' };
            case 'bestseller':
                return { reviewCount: 'desc' };
            default:
                return { id: 'asc' };
        }
    }
    async findAll(query) {
        const rows = await this.prisma.book.findMany({
            where: this.buildWhere(query),
            orderBy: this.buildOrderBy(query.sortBy),
        });
        return rows.map(mappers_1.mapBook);
    }
    async findFeatured() {
        const rows = await this.prisma.book.findMany({ where: { isFeatured: true } });
        return rows.map(mappers_1.mapBook);
    }
    async findNewArrivals() {
        const rows = await this.prisma.book.findMany({
            where: { isNewArrival: true },
        });
        return rows.map(mappers_1.mapBook);
    }
    async findBestSellers() {
        const rows = await this.prisma.book.findMany({
            where: { isBestSeller: true },
        });
        return rows.map(mappers_1.mapBook);
    }
    async findOne(id) {
        const book = await this.prisma.book.findUnique({ where: { id } });
        if (!book)
            throw new common_1.NotFoundException(`Book ${id} not found`);
        return (0, mappers_1.mapBook)(book);
    }
    async getFiltersMeta() {
        const books = await this.prisma.book.findMany({
            select: { author: true, publisher: true },
        });
        const authors = [...new Set(books.map((b) => b.author))].sort();
        const publishers = [...new Set(books.map((b) => b.publisher))].sort();
        return { authors, publishers };
    }
};
exports.BooksService = BooksService;
exports.BooksService = BooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BooksService);
//# sourceMappingURL=books.service.js.map