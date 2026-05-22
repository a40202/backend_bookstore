import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [InvoicesModule, CartModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
