import type { DashboardStats, ReportsStats } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
export declare class StatsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboard(): Promise<DashboardStats>;
    getReports(range: string): Promise<ReportsStats>;
}
