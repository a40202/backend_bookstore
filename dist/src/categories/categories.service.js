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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function slugify(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async attachBookCounts(categories) {
        const books = await this.prisma.book.findMany({
            select: { categoryId: true, category: true },
        });
        return categories.map((cat) => {
            const count = books.filter((b) => b.categoryId === cat.id || b.category === cat.name).length;
            return { ...cat, bookCount: count };
        });
    }
    async findAll() {
        const rows = await this.prisma.category.findMany({ orderBy: { id: 'asc' } });
        return this.attachBookCounts(rows);
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException(`Category ${id} not found`);
        const [withCount] = await this.attachBookCounts([category]);
        return withCount;
    }
    async create(dto) {
        const slug = dto.slug?.trim() || slugify(dto.name);
        const exists = await this.prisma.category.findUnique({ where: { slug } });
        if (exists)
            throw new common_1.ConflictException('Slug da ton tai');
        const cats = await this.prisma.category.findMany({ select: { id: true } });
        const maxId = cats.reduce((m, c) => Math.max(m, Number(c.id) || 0), 0);
        const created = await this.prisma.category.create({
            data: {
                id: String(maxId + 1),
                name: dto.name,
                slug,
                description: dto.description,
                bookCount: 0,
            },
        });
        const [withCount] = await this.attachBookCounts([created]);
        return withCount;
    }
    async update(id, dto) {
        if (dto.slug) {
            const dup = await this.prisma.category.findFirst({
                where: { slug: dto.slug, NOT: { id } },
            });
            if (dup)
                throw new common_1.ConflictException('Slug da ton tai');
        }
        const updated = await this.prisma.category.update({
            where: { id },
            data: dto,
        });
        if (dto.name) {
            await this.prisma.book.updateMany({
                where: { categoryId: id },
                data: { category: dto.name },
            });
        }
        const [withCount] = await this.attachBookCounts([updated]);
        return withCount;
    }
    async remove(id) {
        const cat = await this.prisma.category.findUnique({ where: { id } });
        if (!cat)
            throw new common_1.NotFoundException(`Category ${id} not found`);
        const bookCount = await this.prisma.book.count({
            where: { OR: [{ categoryId: id }, { category: cat.name }] },
        });
        if (bookCount > 0) {
            throw new common_1.ConflictException(`Khong the xoa: con ${bookCount} sach trong danh muc`);
        }
        await this.prisma.category.delete({ where: { id } });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map