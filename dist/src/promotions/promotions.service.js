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
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function mapPromotion(p) {
    return {
        id: p.id,
        title: p.title,
        description: p.description,
        code: p.code ?? undefined,
        discountType: p.discountType,
        discountValue: p.discountValue,
        minOrder: p.minOrder ?? undefined,
        startDate: p.startDate.toISOString().split('T')[0],
        endDate: p.endDate.toISOString().split('T')[0],
        isActive: p.isActive,
        imageUrl: p.imageUrl ?? undefined,
        createdAt: p.createdAt.toISOString().split('T')[0],
    };
}
let PromotionsService = class PromotionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findActive() {
        const now = new Date();
        const rows = await this.prisma.promotion.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map(mapPromotion);
    }
    async findAll() {
        const rows = await this.prisma.promotion.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return rows.map(mapPromotion);
    }
    async findOne(id) {
        const row = await this.prisma.promotion.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Khuyen mai khong ton tai');
        return mapPromotion(row);
    }
    async create(data) {
        const row = await this.prisma.promotion.create({
            data: {
                title: data.title,
                description: data.description,
                code: data.code ?? null,
                discountType: data.discountType,
                discountValue: data.discountValue,
                minOrder: data.minOrder ?? null,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                isActive: data.isActive,
                imageUrl: data.imageUrl ?? null,
            },
        });
        return mapPromotion(row);
    }
    async update(id, data) {
        const row = await this.prisma.promotion.update({
            where: { id },
            data: {
                ...data,
                code: data.code === undefined ? undefined : data.code ?? null,
                minOrder: data.minOrder === undefined ? undefined : data.minOrder ?? null,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                imageUrl: data.imageUrl === undefined ? undefined : data.imageUrl ?? null,
            },
        });
        return mapPromotion(row);
    }
    async remove(id) {
        await this.prisma.promotion.delete({ where: { id } });
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map