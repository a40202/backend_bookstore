import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArticlesModule } from './articles/articles.module';
import { CartModule } from './cart/cart.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReturnsModule } from './returns/returns.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { CategoriesModule } from './categories/categories.module';
import { HealthController } from './health/health.controller';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { StatsModule } from './stats/stats.module';
import { UsersModule } from './users/users.module';
import { InventoryModule } from './inventory/inventory.module';
import { SupportModule } from './support/support.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PermissionsModule,
    BooksModule,
    CategoriesModule,
    AuthModule,
    OrdersModule,
    ReviewsModule,
    UsersModule,
    StatsModule,
    PromotionsModule,
    ArticlesModule,
    InvoicesModule,
    CartModule,
    ReturnsModule,
    InventoryModule,
    SupportModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
