# Kết nối PostgreSQL

## Cách 1: Docker (khuyến nghị)

Từ thư mục gốc dự án:

```bash
docker compose up -d
cd backend
npm run db:migrate
npm run db:seed
```

## Cách 2: PostgreSQL cài sẵn trên Windows

1. Cài [PostgreSQL](https://www.postgresql.org/download/windows/)
2. Tạo database `bookstore`, user/password tùy chọn
3. Sửa `backend/.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/bookstore?schema=public"
```

4. Chạy migrate + seed:

```bash
cd backend
npm run db:migrate
npm run db:seed
```

## Cách 3: Neon (cloud, miễn phí)

1. Tạo project tại [neon.tech](https://neon.tech)
2. Copy connection string vào `DATABASE_URL` trong `backend/.env`
3. `npm run db:migrate` và `npm run db:seed`

## JWT

Trong `backend/.env`:

```
JWT_SECRET=<chuỗi-bí-mật-dài>
JWT_EXPIRES_IN=7d
```

## Chạy API

```bash
npm run dev:api
```

Tài khoản sau khi seed (mật khẩu giữ nguyên):

- `admin@bookstore.com` / `admin123`
- `customer@gmail.com` / `customer123`
