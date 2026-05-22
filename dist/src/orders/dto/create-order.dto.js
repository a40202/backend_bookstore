"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderDto = exports.CreateOrderItemDto = void 0;
class CreateOrderItemDto {
    bookId;
    quantity;
}
exports.CreateOrderItemDto = CreateOrderItemDto;
class CreateOrderDto {
    items;
    shippingAddress;
    phone;
    paymentMethod;
    shippingFee;
    buyerName;
    buyerEmail;
    note;
}
exports.CreateOrderDto = CreateOrderDto;
//# sourceMappingURL=create-order.dto.js.map