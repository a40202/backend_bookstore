import {
  PrismaClient,
  Role,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  seedBooks,
  seedCategories,
  seedInventoryLogs,
  seedOrders,
  seedReviews,
  seedUsers,
} from '../src/data/seed';

const prisma = new PrismaClient();

async function main() {
  await prisma.supportTicket.deleteMany();
  await prisma.returnItem.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.article.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categorySlugToId = new Map<string, string>();
  for (const c of seedCategories) {
    await prisma.category.create({
      data: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        bookCount: c.bookCount,
      },
    });
    categorySlugToId.set(c.slug, c.id);
    categorySlugToId.set(c.name, c.id);
  }

  for (const b of seedBooks) {
    const categoryId =
      [...seedCategories].find((c) => c.name === b.category)?.id ?? null;
    await prisma.book.create({
      data: {
        id: b.id,
        title: b.title,
        author: b.author,
        price: b.price,
        originalPrice: b.originalPrice ?? null,
        description: b.description,
        coverImage: b.coverImage,
        category: b.category,
        categoryId,
        publisher: b.publisher,
        publishYear: b.publishYear,
        pages: b.pages,
        language: b.language,
        isbn: b.isbn,
        stock: b.stock,
        soldCount: b.soldCount ?? null,
        rating: b.rating,
        reviewCount: b.reviewCount,
        isFeatured: b.isFeatured ?? false,
        isNewArrival: b.isNewArrival ?? false,
        isBestSeller: b.isBestSeller ?? false,
      },
    });
  }

  for (const u of seedUsers) {
    const hashed = await bcrypt.hash(u.password, 10);
    await prisma.user.create({
      data: {
        id: u.id,
        email: u.email,
        password: hashed,
        fullName: u.fullName,
        name: u.name ?? u.fullName,
        phone: u.phone,
        address: u.address,
        role: u.role as Role,
        isActive: u.isActive ?? true,
        createdAt: new Date(u.createdAt),
      },
    });
  }

  /** Ngày đơn trong 90 ngày gần đây để báo cáo thống kê có dữ liệu */
  const orderDaysAgo = [3, 7, 12, 18, 25, 40, 55, 72];

  let invNum = 0;
  for (let i = 0; i < seedOrders.length; i++) {
    const o = seedOrders[i];
    const subtotal = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = o.totalAmount - subtotal;
    const user = seedUsers.find((u) => u.id === o.userId);

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (orderDaysAgo[i] ?? 14));
    createdAt.setHours(10, 0, 0, 0);
    const updatedAt = new Date(createdAt);
    updatedAt.setDate(updatedAt.getDate() + 2);

    await prisma.order.create({
      data: {
        id: o.id,
        userId: o.userId,
        totalAmount: o.totalAmount,
        shippingAddress: o.shippingAddress,
        phone: o.phone,
        paymentMethod: o.paymentMethod as PaymentMethod,
        status: o.status as OrderStatus,
        createdAt,
        updatedAt,
        items: {
          create: o.items.map((item) => ({
            bookId: item.bookId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        invoice: {
          create: {
            id: `INV${String(++invNum).padStart(4, '0')}`,
            userId: o.userId,
            subtotal,
            shippingFee,
            discount: 0,
            totalAmount: o.totalAmount,
            paymentMethod: o.paymentMethod as PaymentMethod,
            paymentStatus:
              o.paymentMethod === 'transfer'
                ? PaymentStatus.unpaid
                : PaymentStatus.paid,
            buyerName: user?.fullName ?? 'Khách hàng',
            buyerEmail: user?.email ?? '',
            buyerPhone: o.phone,
            buyerAddress: o.shippingAddress,
            paidAt: o.paymentMethod === 'cash' ? updatedAt : null,
            issuedAt: createdAt,
          },
        },
      },
    });
  }

  for (const r of seedReviews) {
    await prisma.review.create({
      data: {
        id: r.id,
        bookId: r.bookId,
        userId: r.userId,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        createdAt: new Date(r.createdAt),
      },
    });
  }

  for (const log of seedInventoryLogs) {
    await prisma.inventoryLog.create({
      data: {
        id: log.id,
        bookId: log.bookId,
        type: log.type,
        quantity: log.quantity,
        note: log.note,
        createdAt: new Date(log.createdAt),
        createdBy: log.createdBy,
      },
    });
  }

  await prisma.supportTicket.createMany({
    data: [
      {
        id: 'TK001',
        customerId: '3',
        customerName: 'Nguyễn Văn A',
        customerEmail: 'customer@gmail.com',
        customerPhone: '0901234567',
        subject: 'Đơn hàng chưa nhận được',
        message:
          'Tôi đặt hàng nhưng đã 7 ngày chưa nhận được. Vui lòng kiểm tra giúp tôi.',
        status: 'open',
        priority: 'high',
        orderId: 'ORD001',
        createdAt: new Date('2024-05-08'),
      },
      {
        id: 'TK002',
        customerId: '4',
        customerName: 'Trần Thị B',
        customerEmail: 'tran.thi.b@gmail.com',
        subject: 'Sách bị hỏng, muốn đổi trả',
        message:
          'Sách tôi nhận được bị nhăn trang. Tôi muốn đổi sách mới.',
        status: 'in_progress',
        priority: 'medium',
        response:
          'Chúng tôi đã ghi nhận phản ánh của bạn và đang xử lý.',
        createdAt: new Date('2024-05-10'),
      },
    ],
  });

  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.promotion.createMany({
    data: [
      {
        title: 'Giảm 20% sách văn học',
        description: 'Áp dụng cho tất cả sách thể loại Văn học. Mã BOOK20.',
        code: 'BOOK20',
        discountType: 'percent',
        discountValue: 20,
        minOrder: 150000,
        startDate: now,
        endDate: nextMonth,
        isActive: true,
        imageUrl:
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=400&fit=crop',
      },
      {
        title: 'Miễn phí vận chuyển',
        description: 'Đơn hàng từ 300.000đ được miễn phí ship toàn quốc.',
        code: 'FREESHIP',
        discountType: 'fixed',
        discountValue: 30000,
        minOrder: 300000,
        startDate: now,
        endDate: nextMonth,
        isActive: true,
        imageUrl:
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=400&fit=crop',
      },
      {
        title: 'Flash Sale cuối tuần',
        description: 'Giảm 15% cho sách bán chạy mỗi cuối tuần.',
        code: 'WEEKEND15',
        discountType: 'percent',
        discountValue: 15,
        minOrder: 100000,
        startDate: now,
        endDate: nextMonth,
        isActive: true,
      },
    ],
  });

  await prisma.article.createMany({
    data: [
      {
        title: '5 cuốn sách nên đọc trong năm 2026',
        slug: '5-cuon-sach-nen-doc-2026',
        excerpt:
          'Danh sách sách giúp bạn phát triển bản thân và mở rộng tư duy trong năm mới.',
        content:
          '<p>Đọc sách là thói quen tuyệt vời giúp mở rộng kiến thức và tư duy.</p><p>Dưới đây là 5 cuốn sách được yêu thích nhất tại BookStore: Nhà Giá Kim, Đắc Nhân Tâm, Atomic Habits, Sapiens và Tuổi Trẻ Đang Giá Bao Nhiêu.</p><p>Hãy bắt đầu hành trình đọc sách ngay hôm nay!</p>',
        coverImage:
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop',
        authorName: 'BookStore Team',
        isPublished: true,
        publishedAt: now,
      },
      {
        title: 'Cách chọn sách phù hợp cho trẻ em',
        slug: 'chon-sach-cho-tre-em',
        excerpt:
          'Hướng dẫn phụ huynh chọn sách chất lượng, phù hợp độ tuổi cho con.',
        content:
          '<p>Chọn sách cho trẻ cần cân nhắc độ tuổi, chủ đề và chất lượng nội dung.</p><p>BookStore có nhiều đầu sách thiếu nhi từ NXB Kim Đồng, Doraemon và truyện cổ tích Việt Nam.</p>',
        coverImage:
          'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800&h=450&fit=crop',
        authorName: 'Nguyễn Văn A',
        isPublished: true,
        publishedAt: now,
      },
      {
        title: 'Xu hướng đọc sách kỹ năng sống',
        slug: 'xu-huong-sach-ky-nang-song',
        excerpt: 'Sách self-help đang lên ngôi trong thị trường Việt Nam.',
        content:
          '<p>Người đọc Việt Nam ngày càng quan tâm đến sách phát triển bản thân.</p><p>Các đầu sách về thói quen, tư duy làm giàu và quản lý thời gian bán rất chạy.</p>',
        authorName: 'BookStore Editor',
        isPublished: true,
        publishedAt: now,
      },
    ],
  });

  await prisma.staffRoleConfig.upsert({
    where: { id: 'staff' },
    create: {
      id: 'staff',
      permissions: [
        'dashboard',
        'books',
        'categories',
        'inventory',
        'orders',
        'returns',
        'invoices',
        'articles',
        'support',
      ],
    },
    update: {},
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
