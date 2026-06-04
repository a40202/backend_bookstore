import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { PublicUser } from '../common/types';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @Roles('admin', 'staff')
  @RequirePermissions('dashboard')
  getDashboard(@CurrentUser() user: PublicUser) {
    const canViewRevenue =
      user.role === 'admin' ||
      (user.permissions?.includes('view_revenue') ?? false);
    if (!canViewRevenue) {
      return this.statsService.getStaffDashboard();
    }
    return this.statsService.getDashboard();
  }

  @Get('reports')
  @Roles('admin', 'staff')
  @RequirePermissions('reports')
  getReports(@Query('range') range?: string) {
    return this.statsService.getReports(range ?? '30days');
  }
}
