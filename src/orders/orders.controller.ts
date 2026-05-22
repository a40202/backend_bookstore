import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { OrderStatus, PublicUser } from '../common/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@CurrentUser() user: PublicUser, @Query('userId') userId?: string) {
    return this.ordersService.findAll(user, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.ordersService.findOne(id, user);
  }

  @Post()
  create(@CurrentUser() user: PublicUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.ordersService.cancelByCustomer(id, user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @CurrentUser() user: PublicUser,
  ) {
    return this.ordersService.updateStatus(id, status, user);
  }
}
