import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { PublicUser } from '../common/types';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@CurrentUser() user: PublicUser) {
    if (user.role === 'admin' || user.role === 'staff') {
      return this.invoicesService.findAllAdmin();
    }
    return this.invoicesService.findAllForUser(user.id);
  }

  @Get('order/:orderId')
  findByOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.invoicesService.findByOrder(orderId, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.invoicesService.findById(id, user);
  }

  @Patch(':id/payment-status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff')
  updatePayment(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
  ) {
    return this.invoicesService.updatePaymentStatus(id, status);
  }
}
