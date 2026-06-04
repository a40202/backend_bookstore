import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import type { Promotion } from '../common/types';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PromotionsService } from './promotions.service';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get('active')
  findActive() {
    return this.promotionsService.findActive();
  }

  @Post('validate')
  validate(@Body() dto: ValidatePromotionDto) {
    return this.promotionsService.validateCode(
      dto.code,
      dto.subtotal,
      dto.shippingFee ?? 0,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'staff')
  @RequirePermissions('promotions')
  findAll() {
    return this.promotionsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'staff')
  @RequirePermissions('promotions')
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'staff')
  @RequirePermissions('promotions')
  create(@Body() data: Omit<Promotion, 'id' | 'createdAt'>) {
    return this.promotionsService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'staff')
  @RequirePermissions('promotions')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Omit<Promotion, 'id' | 'createdAt'>>,
  ) {
    return this.promotionsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'staff')
  @RequirePermissions('promotions')
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
