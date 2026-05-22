import { Injectable } from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import type { DashboardStats, ReportsStats } from '../common/types';
import { mapOrder } from '../common/mappers';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(): Promise<DashboardStats> {
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
      this.prisma.user.count({ where: { role: Role.customer } }),
      this.prisma.book.count({ where: { stock: { lt: 10 } } }),
    ]);

    const completed = orders.filter((o) => o.status === OrderStatus.delivered);
    const totalRevenue = completed.reduce((s, o) => s + o.totalAmount, 0);
    const pendingOrders = orders.filter(
      (o) => o.status === OrderStatus.pending,
    ).length;

    return {
      totalBooks: books,
      totalOrders: orders.length,
      totalUsers: users,
      totalRevenue,
      pendingOrders,
      lowStockBooks: lowStock,
      recentOrders: orders.slice(0, 5).map(mapOrder),
    };
  }

  async getReports(range: string): Promise<ReportsStats> {
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

    const completed = currentOrders.filter(
      (o) => o.status === OrderStatus.delivered,
    );
    const totalRevenue = completed.reduce((s, o) => s + o.totalAmount, 0);
    const prevRevenue = prevOrders
      .filter((o) => o.status === OrderStatus.delivered)
      .reduce((s, o) => s + o.totalAmount, 0);

    const revenueChange =
      prevRevenue > 0
        ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
        : 0;
    const ordersChange =
      prevOrders.length > 0
        ? ((currentOrders.length - prevOrders.length) / prevOrders.length) *
          100
        : 0;

    const bookMap = new Map(allBooks.map((b) => [b.id, b.title]));
    const salesMap = new Map<
      string,
      { quantity: number; revenue: number }
    >();

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

    const ordersByStatus: Record<string, number> = {};
    for (const o of currentOrders) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
    }

    const monthMap = new Map<string, { revenue: number; orders: number }>();
    for (const o of currentOrders) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const cur = monthMap.get(key) ?? { revenue: 0, orders: 0 };
      cur.orders += 1;
      if (o.status === OrderStatus.delivered) cur.revenue += o.totalAmount;
      monthMap.set(key, cur);
    }

    const revenueByMonth = [...monthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));

    return {
      totalRevenue,
      totalOrders: currentOrders.length,
      completedOrders: completed.length,
      cancelledOrders: currentOrders.filter(
        (o) => o.status === OrderStatus.cancelled,
      ).length,
      avgOrderValue:
        completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0,
      revenueChange: Math.round(revenueChange * 10) / 10,
      ordersChange: Math.round(ordersChange * 10) / 10,
      topBooks,
      ordersByStatus,
      revenueByMonth,
    };
  }
}
