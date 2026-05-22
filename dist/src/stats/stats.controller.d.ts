import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getDashboard(): Promise<import("../common/types").DashboardStats>;
    getReports(range?: string): Promise<import("../common/types").ReportsStats>;
}
