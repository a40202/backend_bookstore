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
  { id: '1', name: 'Van hoc', slug: 'van-hoc', description: 'Sach van hoc Viet Nam va the gioi', bookCount: 45 },
  { id: '2', name: 'Kinh te', slug: 'kinh-te', description: 'Sach kinh te, kinh doanh', bookCount: 32 },
  { id: '3', name: 'Tam ly - Ky nang song', slug: 'tam-ly-ky-nang-song', description: 'Sach tam ly, phat trien ban than', bookCount: 28 },
  { id: '4', name: 'Thieu nhi', slug: 'thieu-nhi', description: 'Sach danh cho thieu nhi', bookCount: 56 },
  { id: '5', name: 'Khoa hoc', slug: 'khoa-hoc', description: 'Sach khoa hoc tu nhien va xa hoi', bookCount: 23 },
  { id: '6', name: 'Lich su', slug: 'lich-su', description: 'Sach lich su Viet Nam va the gioi', bookCount: 19 },
  { id: '7', name: 'Nghe thuat', slug: 'nghe-thuat', description: 'Sach ve nghe thuat, am nhac, hoi hoa', bookCount: 15 },
  { id: '8', name: 'Ngoai ngu', slug: 'ngoai-ngu', description: 'Sach hoc ngoai ngu', bookCount: 41 },
];

export const seedBooks: Book[] = [
  { id: '1', title: 'Nha Gia Kim', author: 'Paulo Coelho', price: 79000, originalPrice: 95000, description: 'Nha gia kim cua Paulo Coelho la cuon sach ban chay nhat moi thoi dai.', coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', category: 'Van hoc', publisher: 'NXB Van hoc', publishYear: 2020, pages: 228, language: 'Tieng Viet', isbn: '978-604-1-12345-6', stock: 150, rating: 4.8, reviewCount: 1250, isFeatured: true, isBestSeller: true },
  { id: '2', title: 'Dac Nhan Tam', author: 'Dale Carnegie', price: 86000, originalPrice: 108000, description: 'Dac nhan tam la cuon sach noi tieng nhat, ban chay nhat va co anh huong nhat moi thoi dai.', coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', category: 'Tam ly - Ky nang song', publisher: 'NXB Tong hop TPHCM', publishYear: 2021, pages: 320, language: 'Tieng Viet', isbn: '978-604-1-12346-7', stock: 200, rating: 4.9, reviewCount: 2100, isFeatured: true, isBestSeller: true },
  { id: '3', title: 'Sapiens: Luoc Su Loai Nguoi', author: 'Yuval Noah Harari', price: 209000, originalPrice: 239000, description: 'Sapiens la cuon sach lich su ve qua trinh phat trien cua loai nguoi.', coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop', category: 'Lich su', publisher: 'NXB Tre', publishYear: 2022, pages: 560, language: 'Tieng Viet', isbn: '978-604-1-12347-8', stock: 85, rating: 4.7, reviewCount: 890, isFeatured: true },
  { id: '4', title: 'Tuoi Tre Dang Gia Bao Nhieu', author: 'Rosie Nguyen', price: 70000, originalPrice: 85000, description: 'Tuoi tre dang gia bao nhieu la cuon sach truyen cam hung.', coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', category: 'Tam ly - Ky nang song', publisher: 'NXB Hoi Nha Van', publishYear: 2021, pages: 268, language: 'Tieng Viet', isbn: '978-604-1-12348-9', stock: 120, rating: 4.5, reviewCount: 650, isNewArrival: true },
  { id: '5', title: 'Nguoi Ban Hang Vi Dai Nhat The Gioi', author: 'Og Mandino', price: 62000, description: 'Cuon sach huyen thoai ve nghe thuat ban hang.', coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop', category: 'Kinh te', publisher: 'NXB Lao Dong', publishYear: 2020, pages: 192, language: 'Tieng Viet', isbn: '978-604-1-12349-0', stock: 95, rating: 4.6, reviewCount: 420, isBestSeller: true },
  { id: '6', title: 'Hai So Phan', author: 'Jeffrey Archer', price: 145000, originalPrice: 175000, description: 'Hai so phan la cau chuyen ve hai nguoi dan ong sinh cung ngay.', coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', category: 'Van hoc', publisher: 'NXB Van hoc', publishYear: 2023, pages: 680, language: 'Tieng Viet', isbn: '978-604-1-12350-1', stock: 60, rating: 4.4, reviewCount: 320, isNewArrival: true },
  { id: '7', title: 'Hoang Tu Be', author: 'Antoine de Saint-Exupery', price: 55000, description: 'Hoang tu be la truyen ngan noi tieng nhat the gioi.', coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', category: 'Thieu nhi', publisher: 'NXB Kim Dong', publishYear: 2021, pages: 96, language: 'Tieng Viet', isbn: '978-604-1-12351-2', stock: 250, rating: 4.9, reviewCount: 1800, isFeatured: true, isBestSeller: true },
  { id: '8', title: 'Atomic Habits', author: 'James Clear', price: 169000, originalPrice: 199000, description: 'Atomic Habits la cuon sach huong dan thay doi thoi quen.', coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop', category: 'Tam ly - Ky nang song', publisher: 'NXB Tre', publishYear: 2023, pages: 368, language: 'Tieng Viet', isbn: '978-604-1-12352-3', stock: 180, rating: 4.8, reviewCount: 1100, isNewArrival: true, isBestSeller: true },
  { id: '9', title: 'Nghi Giau Lam Giau', author: 'Napoleon Hill', price: 110000, originalPrice: 135000, description: 'Nghi giau lam giau la cuon sach kinh dien ve tu duy lam giau.', coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', category: 'Kinh te', publisher: 'NXB Tong hop TPHCM', publishYear: 2022, pages: 420, language: 'Tieng Viet', isbn: '978-604-1-12353-4', stock: 140, rating: 4.6, reviewCount: 780, isFeatured: true },
  { id: '10', title: 'Toi Tai Gioi Ban Cung The', author: 'Adam Khoo', price: 115000, description: 'Cuon sach giup ban khoi day tiem nang.', coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop', category: 'Tam ly - Ky nang song', publisher: 'NXB Phu Nu', publishYear: 2021, pages: 284, language: 'Tieng Viet', isbn: '978-604-1-12354-5', stock: 95, rating: 4.5, reviewCount: 540 },
  { id: '11', title: 'Doraemon Tap 1', author: 'Fujiko F. Fujio', price: 22000, description: 'Doraemon la bo truyen tranh noi tieng the gioi.', coverImage: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400&h=600&fit=crop', category: 'Thieu nhi', publisher: 'NXB Kim Dong', publishYear: 2023, pages: 192, language: 'Tieng Viet', isbn: '978-604-1-12355-6', stock: 500, rating: 4.9, reviewCount: 3200, isBestSeller: true },
  { id: '12', title: 'Lich su Viet Nam Bang Tranh', author: 'Nhieu tac gia', price: 185000, originalPrice: 220000, description: 'Bo sach lich su Viet Nam duoc trinh bay bang hinh anh sinh dong.', coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop', category: 'Lich su', publisher: 'NXB Giao Duc', publishYear: 2022, pages: 450, language: 'Tieng Viet', isbn: '978-604-1-12356-7', stock: 45, rating: 4.7, reviewCount: 280, isNewArrival: true },
];

export const seedUsers: SeedUser[] = [
  { id: '1', email: 'admin@bookstore.com', password: 'admin123', fullName: 'Quan Tri Vien', name: 'Quan Tri Vien', phone: '0901234567', address: '123 Nguyen Van Linh, Quan 7, TP.HCM', role: 'admin', isActive: true, createdAt: '2024-01-01' },
  { id: '2', email: 'staff@bookstore.com', password: 'staff123', fullName: 'Nhan Vien A', name: 'Nhan Vien A', phone: '0902345678', address: '456 Le Van Viet, Quan 9, TP.HCM', role: 'staff', isActive: true, createdAt: '2024-02-15' },
  { id: '3', email: 'customer@gmail.com', password: 'customer123', fullName: 'Nguyen Van A', name: 'Nguyen Van A', phone: '0903456789', address: '789 Vo Van Ngan, Thu Duc, TP.HCM', role: 'customer', isActive: true, createdAt: '2024-03-20' },
  { id: '4', email: 'tran.thi.b@gmail.com', password: 'password123', fullName: 'Tran Thi B', name: 'Tran Thi B', phone: '0904567890', address: '12 Pham Van Dong, Binh Thanh, TP.HCM', role: 'customer', isActive: true, createdAt: '2024-04-10' },
  { id: '5', email: 'le.van.c@gmail.com', password: 'password123', fullName: 'Le Van C', name: 'Le Van C', phone: '0905678901', address: '34 Nguyen Huu Tho, Nha Be, TP.HCM', role: 'customer', isActive: false, createdAt: '2024-05-05' },
];

export const seedOrders: Order[] = [
  { id: 'ORD001', userId: '3', items: [{ bookId: '1', quantity: 2, price: 79000 }, { bookId: '2', quantity: 1, price: 86000 }], totalAmount: 244000, shippingAddress: '789 Vo Van Ngan, Thu Duc, TP.HCM', phone: '0903456789', paymentMethod: 'transfer', status: 'delivered', createdAt: '2024-05-01', updatedAt: '2024-05-05' },
  { id: 'ORD002', userId: '3', items: [{ bookId: '3', quantity: 1, price: 209000 }], totalAmount: 209000, shippingAddress: '789 Vo Van Ngan, Thu Duc, TP.HCM', phone: '0903456789', paymentMethod: 'cash', status: 'shipping', createdAt: '2024-05-10', updatedAt: '2024-05-12' },
  { id: 'ORD003', userId: '3', items: [{ bookId: '7', quantity: 3, price: 55000 }, { bookId: '11', quantity: 5, price: 22000 }], totalAmount: 275000, shippingAddress: '789 Vo Van Ngan, Thu Duc, TP.HCM', phone: '0903456789', paymentMethod: 'transfer', status: 'pending', createdAt: '2024-05-15', updatedAt: '2024-05-15' },
];

export const seedReviews: Review[] = [
  { id: '1', bookId: '1', userId: '3', userName: 'Nguyen Van A', rating: 5, comment: 'Cuon sach tuyet voi, rat dang doc.', createdAt: '2024-05-05' },
  { id: '2', bookId: '1', userId: '4', userName: 'Tran Thi B', rating: 4, comment: 'Sach hay, giao hang nhanh.', createdAt: '2024-05-03' },
  { id: '3', bookId: '2', userId: '3', userName: 'Nguyen Van A', rating: 5, comment: 'Day la cuon sach thay doi cuoc doi toi.', createdAt: '2024-04-20' },
];

export const seedInventoryLogs: InventoryLog[] = [
  { id: '1', bookId: '1', type: 'import', quantity: 100, note: 'Nhap hang dot 1 thang 5', createdAt: '2024-05-01', createdBy: 'Nhan Vien A' },
  { id: '2', bookId: '2', type: 'import', quantity: 150, note: 'Nhap hang dot 1 thang 5', createdAt: '2024-05-01', createdBy: 'Nhan Vien A' },
  { id: '3', bookId: '1', type: 'export', quantity: 20, note: 'Ban hang ngay 05/05', createdAt: '2024-05-05', createdBy: 'He thong' },
];
