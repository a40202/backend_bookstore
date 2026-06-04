import type { Book, Category, Order, Review } from '../common/types';

interface SeedUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  name?: string;
  phone: string;
  address: string;
  role: 'customer' | 'admin' | 'staff';
  isActive?: boolean;
  createdAt: string;
}

interface InventoryLog {
  id: string;
  bookId: string;
  type: 'import' | 'export';
  quantity: number;
  note: string;
  createdAt: string;
  createdBy: string;
}

export const seedCategories: Category[] = [
  { id: '1', name: 'Văn học', slug: 'van-hoc', description: 'Sách văn học Việt Nam và thế giới', bookCount: 45 },
  { id: '2', name: 'Kinh tế', slug: 'kinh-te', description: 'Sách kinh tế, kinh doanh', bookCount: 32 },
  { id: '3', name: 'Tâm lý - Kỹ năng sống', slug: 'tam-ly-ky-nang-song', description: 'Sách tâm lý, phát triển bản thân', bookCount: 28 },
  { id: '4', name: 'Thiếu nhi', slug: 'thieu-nhi', description: 'Sách dành cho thiếu nhi', bookCount: 56 },
  { id: '5', name: 'Khoa học', slug: 'khoa-hoc', description: 'Sách khoa học tự nhiên và xã hội', bookCount: 23 },
  { id: '6', name: 'Lịch sử', slug: 'lich-su', description: 'Sách lịch sử Việt Nam và thế giới', bookCount: 19 },
  { id: '7', name: 'Nghệ thuật', slug: 'nghe-thuat', description: 'Sách về nghệ thuật, âm nhạc, hội họa', bookCount: 15 },
  { id: '8', name: 'Ngoại ngữ', slug: 'ngoai-ngu', description: 'Sách học ngoại ngữ', bookCount: 41 },
];

export const seedBooks: Book[] = [
  { id: '1', title: 'Nhà Giá Kim', author: 'Paulo Coelho', price: 79000, originalPrice: 95000, description: 'Nhà giá kim của Paulo Coelho là cuốn sách bán chạy nhất mọi thời đại.', coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', category: 'Văn học', publisher: 'NXB Văn học', publishYear: 2020, pages: 228, language: 'Tiếng Việt', isbn: '978-604-1-12345-6', stock: 150, rating: 4.8, reviewCount: 1250, isFeatured: true, isBestSeller: true },
  { id: '2', title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', price: 86000, originalPrice: 108000, description: 'Đắc nhân tâm là cuốn sách nổi tiếng nhất, bán chạy nhất và có ảnh hưởng nhất mọi thời đại.', coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', category: 'Tâm lý - Kỹ năng sống', publisher: 'NXB Tổng hợp TPHCM', publishYear: 2021, pages: 320, language: 'Tiếng Việt', isbn: '978-604-1-12346-7', stock: 200, rating: 4.9, reviewCount: 2100, isFeatured: true, isBestSeller: true },
  { id: '3', title: 'Sapiens: Lược Sử Loài Người', author: 'Yuval Noah Harari', price: 209000, originalPrice: 239000, description: 'Sapiens là cuốn sách lịch sử về quá trình phát triển của loài người.', coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop', category: 'Lịch sử', publisher: 'NXB Trẻ', publishYear: 2022, pages: 560, language: 'Tiếng Việt', isbn: '978-604-1-12347-8', stock: 85, rating: 4.7, reviewCount: 890, isFeatured: true },
  { id: '4', title: 'Tuổi Trẻ Đang Giá Bao Nhiêu', author: 'Rosie Nguyen', price: 70000, originalPrice: 85000, description: 'Tuổi trẻ đang giá bao nhiêu là cuốn sách truyền cảm hứng.', coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', category: 'Tâm lý - Kỹ năng sống', publisher: 'NXB Hội Nhà Văn', publishYear: 2021, pages: 268, language: 'Tiếng Việt', isbn: '978-604-1-12348-9', stock: 120, rating: 4.5, reviewCount: 650, isNewArrival: true },
  { id: '5', title: 'Người Bán Hàng Vĩ Đại Nhất Thế Giới', author: 'Og Mandino', price: 62000, description: 'Cuốn sách huyền thoại về nghệ thuật bán hàng.', coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop', category: 'Kinh tế', publisher: 'NXB Lao Động', publishYear: 2020, pages: 192, language: 'Tiếng Việt', isbn: '978-604-1-12349-0', stock: 95, rating: 4.6, reviewCount: 420, isBestSeller: true },
  { id: '6', title: 'Hai Số Phận', author: 'Jeffrey Archer', price: 145000, originalPrice: 175000, description: 'Hai số phận là câu chuyện về hai người đàn ông sinh cùng ngày.', coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', category: 'Văn học', publisher: 'NXB Văn học', publishYear: 2023, pages: 680, language: 'Tiếng Việt', isbn: '978-604-1-12350-1', stock: 60, rating: 4.4, reviewCount: 320, isNewArrival: true },
  { id: '7', title: 'Hoàng Tử Bé', author: 'Antoine de Saint-Exupéry', price: 55000, description: 'Hoàng tử bé là truyện ngắn nổi tiếng nhất thế giới.', coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', category: 'Thiếu nhi', publisher: 'NXB Kim Đồng', publishYear: 2021, pages: 96, language: 'Tiếng Việt', isbn: '978-604-1-12351-2', stock: 250, rating: 4.9, reviewCount: 1800, isFeatured: true, isBestSeller: true },
  { id: '8', title: 'Atomic Habits', author: 'James Clear', price: 169000, originalPrice: 199000, description: 'Atomic Habits là cuốn sách hướng dẫn thay đổi thói quen.', coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop', category: 'Tâm lý - Kỹ năng sống', publisher: 'NXB Trẻ', publishYear: 2023, pages: 368, language: 'Tiếng Việt', isbn: '978-604-1-12352-3', stock: 180, rating: 4.8, reviewCount: 1100, isNewArrival: true, isBestSeller: true },
  { id: '9', title: 'Nghĩ Giàu Làm Giàu', author: 'Napoleon Hill', price: 110000, originalPrice: 135000, description: 'Nghĩ giàu làm giàu là cuốn sách kinh điển về tư duy làm giàu.', coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', category: 'Kinh tế', publisher: 'NXB Tổng hợp TPHCM', publishYear: 2022, pages: 420, language: 'Tiếng Việt', isbn: '978-604-1-12353-4', stock: 140, rating: 4.6, reviewCount: 780, isFeatured: true },
  { id: '10', title: 'Tôi Tài Giỏi, Bạn Cũng Thế', author: 'Adam Khoo', price: 115000, description: 'Cuốn sách giúp bạn khơi dậy tiềm năng.', coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop', category: 'Tâm lý - Kỹ năng sống', publisher: 'NXB Phụ Nữ', publishYear: 2021, pages: 284, language: 'Tiếng Việt', isbn: '978-604-1-12354-5', stock: 95, rating: 4.5, reviewCount: 540 },
  { id: '11', title: 'Doraemon Tập 1', author: 'Fujiko F. Fujio', price: 22000, description: 'Doraemon là bộ truyện tranh nổi tiếng thế giới.', coverImage: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400&h=600&fit=crop', category: 'Thiếu nhi', publisher: 'NXB Kim Đồng', publishYear: 2023, pages: 192, language: 'Tiếng Việt', isbn: '978-604-1-12355-6', stock: 500, rating: 4.9, reviewCount: 3200, isBestSeller: true },
  { id: '12', title: 'Lịch Sử Việt Nam Bằng Tranh', author: 'Nhiều tác giả', price: 185000, originalPrice: 220000, description: 'Bộ sách lịch sử Việt Nam được trình bày bằng hình ảnh sinh động.', coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop', category: 'Lịch sử', publisher: 'NXB Giáo Dục', publishYear: 2022, pages: 450, language: 'Tiếng Việt', isbn: '978-604-1-12356-7', stock: 45, rating: 4.7, reviewCount: 280, isNewArrival: true },
];

export const seedUsers: SeedUser[] = [
  { id: '1', email: 'admin@bookstore.com', password: 'admin123', fullName: 'Quản Trị Viên', name: 'Quản Trị Viên', phone: '0901234567', address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM', role: 'admin', isActive: true, createdAt: '2024-01-01' },
  { id: '2', email: 'staff@bookstore.com', password: 'staff123', fullName: 'Nhân Viên A', name: 'Nhân Viên A', phone: '0902345678', address: '456 Lê Văn Việt, Quận 9, TP.HCM', role: 'staff', isActive: true, createdAt: '2024-02-15' },
  { id: '3', email: 'customer@gmail.com', password: 'customer123', fullName: 'Nguyễn Văn A', name: 'Nguyễn Văn A', phone: '0903456789', address: '789 Võ Văn Ngân, Thủ Đức, TP.HCM', role: 'customer', isActive: true, createdAt: '2024-03-20' },
  { id: '4', email: 'tran.thi.b@gmail.com', password: 'password123', fullName: 'Trần Thị B', name: 'Trần Thị B', phone: '0904567890', address: '12 Phạm Văn Đồng, Bình Thạnh, TP.HCM', role: 'customer', isActive: true, createdAt: '2024-04-10' },
  { id: '5', email: 'le.van.c@gmail.com', password: 'password123', fullName: 'Lê Văn C', name: 'Lê Văn C', phone: '0905678901', address: '34 Nguyễn Hữu Thọ, Nhà Bè, TP.HCM', role: 'customer', isActive: false, createdAt: '2024-05-05' },
];

/** createdAt/updatedAt được ghi đè bằng ngày tương đối khi seed DB (prisma/seed.ts) */
export const seedOrders: Order[] = [
  { id: 'ORD001', userId: '3', items: [{ bookId: '1', quantity: 2, price: 79000 }, { bookId: '2', quantity: 1, price: 86000 }], totalAmount: 244000, shippingAddress: '789 Võ Văn Ngân, Thủ Đức, TP.HCM', phone: '0903456789', paymentMethod: 'transfer', status: 'delivered', createdAt: '2024-05-01', updatedAt: '2024-05-05' },
  { id: 'ORD002', userId: '3', items: [{ bookId: '3', quantity: 1, price: 209000 }], totalAmount: 209000, shippingAddress: '789 Võ Văn Ngân, Thủ Đức, TP.HCM', phone: '0903456789', paymentMethod: 'cash', status: 'shipping', createdAt: '2024-05-10', updatedAt: '2024-05-12' },
  { id: 'ORD003', userId: '3', items: [{ bookId: '7', quantity: 3, price: 55000 }, { bookId: '11', quantity: 5, price: 22000 }], totalAmount: 275000, shippingAddress: '789 Võ Văn Ngân, Thủ Đức, TP.HCM', phone: '0903456789', paymentMethod: 'transfer', status: 'pending', createdAt: '2024-05-15', updatedAt: '2024-05-15' },
  { id: 'ORD004', userId: '4', items: [{ bookId: '4', quantity: 1, price: 189000 }], totalAmount: 189000, shippingAddress: '456 Lê Lợi, Quận 1, TP.HCM', phone: '0902345678', paymentMethod: 'transfer', status: 'delivered', createdAt: '2024-05-01', updatedAt: '2024-05-03' },
  { id: 'ORD005', userId: '3', items: [{ bookId: '5', quantity: 2, price: 125000 }], totalAmount: 250000, shippingAddress: '789 Võ Văn Ngân, Thủ Đức, TP.HCM', phone: '0903456789', paymentMethod: 'cash', status: 'delivered', createdAt: '2024-05-01', updatedAt: '2024-05-02' },
  { id: 'ORD006', userId: '4', items: [{ bookId: '8', quantity: 1, price: 168000 }], totalAmount: 168000, shippingAddress: '456 Lê Lợi, Quận 1, TP.HCM', phone: '0902345678', paymentMethod: 'transfer', status: 'confirmed', createdAt: '2024-05-01', updatedAt: '2024-05-01' },
  { id: 'ORD007', userId: '3', items: [{ bookId: '10', quantity: 1, price: 145000 }], totalAmount: 145000, shippingAddress: '789 Võ Văn Ngân, Thủ Đức, TP.HCM', phone: '0903456789', paymentMethod: 'transfer', status: 'cancelled', createdAt: '2024-05-01', updatedAt: '2024-05-01' },
];

export const seedReviews: Review[] = [
  { id: '1', bookId: '1', userId: '3', userName: 'Nguyễn Văn A', rating: 5, comment: 'Cuốn sách tuyệt vời, rất đáng đọc.', createdAt: '2024-05-05' },
  { id: '2', bookId: '1', userId: '4', userName: 'Trần Thị B', rating: 4, comment: 'Sách hay, giao hàng nhanh.', createdAt: '2024-05-03' },
  { id: '3', bookId: '2', userId: '3', userName: 'Nguyễn Văn A', rating: 5, comment: 'Đây là cuốn sách thay đổi cuộc đời tôi.', createdAt: '2024-04-20' },
];

export const seedInventoryLogs: InventoryLog[] = [
  { id: '1', bookId: '1', type: 'import', quantity: 100, note: 'Nhập hàng đợt 1 tháng 5', createdAt: '2024-05-01', createdBy: 'Nhân Viên A' },
  { id: '2', bookId: '2', type: 'import', quantity: 150, note: 'Nhập hàng đợt 1 tháng 5', createdAt: '2024-05-01', createdBy: 'Nhân Viên A' },
  { id: '3', bookId: '1', type: 'export', quantity: 20, note: 'Bán hàng ngày 05/05', createdAt: '2024-05-05', createdBy: 'Hệ thống' },
];
