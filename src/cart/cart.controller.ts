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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { PublicUser } from '../common/types';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: PublicUser) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  addItem(
    @CurrentUser() user: PublicUser,
    @Body() body: { bookId: string; quantity?: number },
  ) {
    return this.cartService.addItem(user.id, body.bookId, body.quantity ?? 1);
  }

  @Patch('items/:bookId')
  updateItem(
    @CurrentUser() user: PublicUser,
    @Param('bookId') bookId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateItem(user.id, bookId, quantity);
  }

  @Delete('items/:bookId')
  removeItem(
    @CurrentUser() user: PublicUser,
    @Param('bookId') bookId: string,
  ) {
    return this.cartService.removeItem(user.id, bookId);
  }

  @Delete()
  clearCart(@CurrentUser() user: PublicUser) {
    return this.cartService.clearCart(user.id);
  }

  @Post('merge')
  merge(
    @CurrentUser() user: PublicUser,
    @Body() body: { items: { bookId: string; quantity: number }[] },
  ) {
    return this.cartService.mergeItems(user.id, body.items ?? []);
  }
}
