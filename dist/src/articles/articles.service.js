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
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function mapArticle(a) {
    return {
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        coverImage: a.coverImage ?? undefined,
        authorName: a.authorName,
        isPublished: a.isPublished,
        publishedAt: a.publishedAt?.toISOString().split('T')[0],
        createdAt: a.createdAt.toISOString().split('T')[0],
        updatedAt: a.updatedAt.toISOString().split('T')[0],
    };
}
function slugify(title) {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
let ArticlesService = class ArticlesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findPublished() {
        const rows = await this.prisma.article.findMany({
            where: { isPublished: true },
            orderBy: { publishedAt: 'desc' },
        });
        return rows.map(mapArticle);
    }
    async findBySlug(slug) {
        const row = await this.prisma.article.findFirst({
            where: { slug, isPublished: true },
        });
        if (!row)
            throw new common_1.NotFoundException('Bai viet khong ton tai');
        return mapArticle(row);
    }
    async findAll() {
        const rows = await this.prisma.article.findMany({
            orderBy: { updatedAt: 'desc' },
        });
        return rows.map(mapArticle);
    }
    async findOne(id) {
        const row = await this.prisma.article.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Bai viet khong ton tai');
        return mapArticle(row);
    }
    async create(data) {
        let slug = data.slug ?? slugify(data.title);
        const existing = await this.prisma.article.findUnique({ where: { slug } });
        if (existing)
            slug = `${slug}-${Date.now()}`;
        const row = await this.prisma.article.create({
            data: {
                title: data.title,
                slug,
                excerpt: data.excerpt,
                content: data.content,
                coverImage: data.coverImage ?? null,
                authorName: data.authorName,
                isPublished: data.isPublished,
                publishedAt: data.isPublished && data.publishedAt
                    ? new Date(data.publishedAt)
                    : data.isPublished
                        ? new Date()
                        : null,
            },
        });
        return mapArticle(row);
    }
    async update(id, data) {
        const current = await this.prisma.article.findUnique({ where: { id } });
        if (!current)
            throw new common_1.NotFoundException('Bai viet khong ton tai');
        const isPublished = data.isPublished ?? current.isPublished;
        let publishedAt = current.publishedAt;
        if (data.publishedAt)
            publishedAt = new Date(data.publishedAt);
        else if (isPublished && !current.publishedAt)
            publishedAt = new Date();
        const row = await this.prisma.article.update({
            where: { id },
            data: {
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                content: data.content,
                coverImage: data.coverImage === undefined ? undefined : data.coverImage ?? null,
                authorName: data.authorName,
                isPublished,
                publishedAt,
            },
        });
        return mapArticle(row);
    }
    async remove(id) {
        await this.prisma.article.delete({ where: { id } });
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ArticlesService);
//# sourceMappingURL=articles.service.js.map