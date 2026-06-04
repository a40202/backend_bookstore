import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { PermissionKey } from '../common/permissions';
import { UpdateStaffPermissionsDto } from './dto/update-staff-permissions.dto';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('definitions')
  @Roles('admin')
  getDefinitions() {
    return this.permissionsService.getDefinitions();
  }

  @Get('staff')
  @Roles('admin')
  async getStaffPermissions(): Promise<{ permissions: PermissionKey[] }> {
    const permissions = await this.permissionsService.getStaffPermissions();
    return { permissions };
  }

  @Put('staff')
  @Roles('admin')
  async updateStaffPermissions(
    @Body() dto: UpdateStaffPermissionsDto,
  ): Promise<{ permissions: PermissionKey[] }> {
    const permissions = await this.permissionsService.setStaffPermissions(
      dto.permissions,
    );
    return { permissions };
  }
}
