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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const mappers_1 = require("../common/mappers");
const prisma_service_1 = require("../prisma/prisma.service");
let StatsService = class StatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard() {
        const [books, orders, users, lowStock] = await Promise.all([
            this.prisma.book.count(),
            this.prisma.order.findMany({
                include: {
                    items: true,
                    user: {
                        select: { fullName: true, name: true, email: true, phone: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where: { role: client_1.Role.customer } }),
            this.prisma.book.count({ where: { stock: { lt: 10 } } }),
        ]);
        const completed = orders.filter((o) => o.status === client_1.OrderStatus.delivered);
        const totalRevenue = completed.reduce((s, o) => s + o.totalAmount, 0);
        const pendingOrders = orders.filter((o) => o.status === client_1.OrderStatus.pending).length;
        return {
            totalBooks: books,
            totalOrders: orders.length,
            totalUsers: users,
            totalRevenue,
            pendingOrders,
            lowStockBooks: lowStock,
            recentOrders: orders.slice(0, 5).map(mappers_1.mapOrder),
        };
    }
    async getReports(range) {
        const now = new Date();
        const startDate = new Date();
        const prevStart = new Date();
        const prevEnd = new Date();
        switch (range) {
            case '7days':
                startDate.setDate(now.getDate() - 7);
                prevStart.setDate(startDate.getDate() - 7);
                prevEnd.setTime(startDate.getTime());
                break;
            case '90days':
                startDate.setDate(now.getDate() - 90);
                prevStart.setDate(startDate.getDate() - 90);
                prevEnd.setTime(startDate.getTime());
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                prevStart.setFullYear(startDate.getFullYear() - 1);
                prevEnd.setTime(startDate.getTime());
                break;
            default:
                startDate.setDate(now.getDate() - 30);
                prevStart.setDate(startDate.getDate() - 30);
                prevEnd.setTime(startDate.getTime());
        }
        const [currentOrders, prevOrders, allBooks] = await Promise.all([
            this.prisma.order.findMany({
                where: { createdAt: { gte: startDate } },
                include: { items: true },
            }),
            this.prisma.order.findMany({
                where: {
                    createdAt: { gte: prevStart, lt: prevEnd },
                },
            }),
            this.prisma.book.findMany({ select: { id: true, title: true } }),
        ]);
        const completed = currentOrders.filter((o) => o.status === client_1.OrderStatus.delivered);
        const totalRevenue = completed.reduce((s, o) => s + o.totalAmount, 0);
        const prevRevenue = prevOrders
            .filter((o) => o.status === client_1.OrderStatus.delivered)
            .reduce((s, o) => s + o.totalAmount, 0);
        const revenueChange = prevRevenue > 0
            ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
            : 0;
        const ordersChange = prevOrders.length > 0
            ? ((currentOrders.length - prevOrders.length) / prevOrders.length) *
                100
            : 0;
        const bookMap = new Map(allBooks.map((b) => [b.id, b.title]));
        const salesMap = new Map();
        for (const order of completed) {
            for (const item of order.items) {
                const cur = salesMap.get(item.bookId) ?? { quantity: 0, revenue: 0 };
                cur.quantity += item.quantity;
                cur.revenue += item.price * item.quantity;
                salesMap.set(item.bookId, cur);
            }
        }
        const topBooks = [...salesMap.entries()]
            .map(([bookId, data]) => ({
            bookId,
            title: bookMap.get(bookId) ?? 'Unknown',
            quantity: data.quantity,
            revenue: data.revenue,
        }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
        const ordersByStatus = {};
        for (const o of currentOrders) {
            ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
        }
        const monthMap = new Map();
        for (const o of currentOrders) {
            const d = new Date(o.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const cur = monthMap.get(key) ?? { revenue: 0, orders: 0 };
            cur.orders += 1;
            if (o.status === client_1.OrderStatus.delivered)
                cur.revenue += o.totalAmount;
            monthMap.set(key, cur);
        }
        const revenueByMonth = [...monthMap.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, data]) => ({ month, ...data }));
        return {
            totalRevenue,
            totalOrders: currentOrders.length,
            completedOrders: completed.length,
            cancelledOrders: currentOrders.filter((o) => o.status === client_1.OrderStatus.cancelled).length,
            avgOrderValue: completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0,
            revenueChange: Math.round(revenueChange * 10) / 10,
            ordersChange: Math.round(ordersChange * 10) / 10,
            topBooks,
            ordersByStatus,
            revenueByMonth,
        };
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map