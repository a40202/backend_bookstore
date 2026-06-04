import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [InvoicesModule, CartModule, PromotionsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
