import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { PublicUser } from '../common/types';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('admin', 'staff')
@RequirePermissions('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('logs')
  findAllLogs() {
    return this.inventoryService.findAllLogs();
  }

  @Post('adjust')
  adjustStock(
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: PublicUser,
  ) {
    const createdBy = user.name ?? user.fullName;
    return this.inventoryService.adjustStock(dto, createdBy);
  }
}
