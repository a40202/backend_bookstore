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
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
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

  let invNum = 0;
  for (const o of seedOrders) {
    const subtotal = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = o.totalAmount - subtotal;
    const user = seedUsers.find((u) => u.id === o.userId);

    await prisma.order.create({
      data: {
        id: o.id,
        userId: o.userId,
        totalAmount: o.totalAmount,
        shippingAddress: o.shippingAddress,
        phone: o.phone,
        paymentMethod: o.paymentMethod as PaymentMethod,
        status: o.status as OrderStatus,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
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
            buyerName: user?.fullName ?? 'Khach hang',
            buyerEmail: user?.email ?? '',
            buyerPhone: o.phone,
            buyerAddress: o.shippingAddress,
            paidAt:
              o.paymentMethod === 'cash' ? new Date(o.updatedAt) : null,
            issuedAt: new Date(o.createdAt),
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

  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.promotion.createMany({
    data: [
      {
        title: 'Giam 20% sach van hoc',
        description: 'Ap dung cho tat ca sach the loai Van hoc. Ma BOOK20.',
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
        title: 'Mien phi van chuyen',
        description: 'Don hang tu 300.000d duoc mien phi ship toan quoc.',
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
        title: 'Flash Sale cuoi tuan',
        description: 'Giam 15% cho sach ban chay moi cuoi tuan.',
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
        title: '5 cuon sach nen doc trong nam 2026',
        slug: '5-cuon-sach-nen-doc-2026',
        excerpt:
          'Danh sach sach giup ban phat trien ban than va mo rong tu duy trong nam moi.',
        content:
          '<p>Doc sach la thoi quen tuyet voi giup mo rong kien thuc va tu duy.</p><p>Duoi day la 5 cuon sach duoc yeu thich nhat tai BookStore: Nha Gia Kim, Dac Nhan Tam, Atomic Habits, Sapiens va Tuoi Tre Dang Gia Bao Nhieu.</p><p>Hay bat dau hanh trinh doc sach ngay hom nay!</p>',
        coverImage:
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=450&fit=crop',
        authorName: 'BookStore Team',
        isPublished: true,
        publishedAt: now,
      },
      {
        title: 'Cach chon sach phu hop cho tre em',
        slug: 'chon-sach-cho-tre-em',
        excerpt:
          'Huong dan phu huynh chon sach chat luong, phu hop do tuoi cho con.',
        content:
          '<p>Chon sach cho tre can can nhac do tuoi, chu de va chat luong noi dung.</p><p>BookStore co nhieu dau sach thieu nhi tu NXB Kim Dong, Doraemon va truyen co tich Viet Nam.</p>',
        coverImage:
          'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800&h=450&fit=crop',
        authorName: 'Nguyen Van A',
        isPublished: true,
        publishedAt: now,
      },
      {
        title: 'Xu huong doc sach ky nang song',
        slug: 'xu-huong-sach-ky-nang-song',
        excerpt: 'Sach self-help dang len ngoi trong thi truong Viet Nam.',
        content:
          '<p>Nguoi doc Viet Nam ngay cang quan tam den sach phat trien ban than.</p><p>Cac dau sach ve thoi quen, tu duy lam giau va quan ly thoi gian ban rat chay.</p>',
        authorName: 'BookStore Editor',
        isPublished: true,
        publishedAt: now,
      },
    ],
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
