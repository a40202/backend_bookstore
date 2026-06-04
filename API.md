# Bookstore API (NestJS + PostgreSQL + JWT)

Base URL: `http://localhost:3001/api`

## Authentication

Đăng nhập / đăng ký trả về:

```json
{
  "user": { "id", "email", "fullName", "role", ... },
  "accessToken": "eyJhbG..."
}
```

Gửi token cho các route bảo vệ:

```
Authorization: Bearer <accessToken>
```

| Method | Path | Auth | Mô tả |
|--------|------|------|--------|
| POST | `/auth/login` | — | Đăng nhập |
| POST | `/auth/register` | — | Đăng ký |
| GET | `/auth/me` | JWT | Thông tin user hiện tại |
| PATCH | `/auth/profile` | JWT | Cập nhật hồ sơ |

## Books (public)

| Method | Path |
|--------|------|
| GET | `/books` |
| GET | `/books/featured` |
| GET | `/books/new-arrivals` |
| GET | `/books/best-sellers` |
| GET | `/books/:id` |

## Categories (public)

| Method | Path |
|--------|------|
| GET | `/categories` |
| GET | `/categories/:id` |

## Cart (JWT — mỗi tài khoản một giỏ riêng)

| Method | Path | Ghi chú |
|--------|------|---------|
| GET | `/cart` | Lấy giỏ (tự tạo nếu chưa có) |
| POST | `/cart/items` | Body: `{ bookId, quantity? }` |
| PATCH | `/cart/items/:bookId` | Body: `{ quantity }` — `0` = xóa |
| DELETE | `/cart/items/:bookId` | Xóa một sách |
| DELETE | `/cart` | Xóa toàn bộ giỏ |
| POST | `/cart/merge` | Gộp giỏ khách (localStorage) sau đăng nhập: `{ items: [{ bookId, quantity }] }` |

Sau khi đặt hàng thành công (`POST /orders`), giỏ DB của user được xóa tự động.

## Returns (JWT)

| Method | Path | Ghi chú |
|--------|------|---------|
| POST | `/returns` | Khách tạo yêu cầu (đơn `delivered`); body: `orderId`, `reason`, `description`, `items[]` |
| GET | `/returns` | Khách: của mình; Admin/Staff: tất cả |
| GET | `/returns/:id` | Chi tiết |
| PATCH | `/returns/:id/status` | Admin/Staff: `status`, `adminNote?`, `refundAmount?` |

Trạng thái: `pending` → `approved` → `received` → `refunded` (hoặc `rejected` / `cancelled`).

## Orders (JWT)

| Method | Path | Ghi chú |
|--------|------|---------|
| GET | `/orders` | Khách: đơn của mình; Admin: tất cả (có thể `?userId=`) |
| GET | `/orders/:id` | |
| POST | `/orders` | Tạo đơn (userId lấy từ JWT); xóa giỏ DB sau khi tạo |
| PATCH | `/orders/:id/cancel` | Khách hủy đơn **chờ xác nhận** (`pending`) của mình; hoàn tồn kho |
| PATCH | `/orders/:id/status` | Admin/Staff only |

## Reviews (public)

| Method | Path |
|--------|------|
| GET | `/reviews?bookId=` |

## Users (JWT + Admin)

| Method | Path |
|--------|------|
| GET | `/users` |
| PATCH | `/users/:id/active` |
