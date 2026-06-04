export const PERMISSION_KEYS = [
  'dashboard',
  'books',
  'categories',
  'inventory',
  'orders',
  'returns',
  'invoices',
  'promotions',
  'articles',
  'users',
  'support',
  'reports',
  'view_revenue',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  dashboard: 'Dashboard',
  books: 'Quản lý sách',
  categories: 'Quản lý danh mục',
  inventory: 'Quản lý kho',
  orders: 'Quản lý đơn hàng',
  returns: 'Trả hàng',
  invoices: 'Hóa đơn',
  promotions: 'Khuyến mãi',
  articles: 'Quản lý bài viết',
  users: 'Quản lý người dùng',
  support: 'Hỗ trợ khách hàng',
  reports: 'Thống kê báo cáo',
  view_revenue: 'Xem doanh thu',
};

/** Quyền mặc định cho nhân viên (không gồm khuyến mãi, users, báo cáo, doanh thu) */
export const DEFAULT_STAFF_PERMISSIONS: PermissionKey[] = [
  'dashboard',
  'books',
  'categories',
  'inventory',
  'orders',
  'returns',
  'invoices',
  'articles',
  'support',
];

export function isPermissionKey(value: string): value is PermissionKey {
  return (PERMISSION_KEYS as readonly string[]).includes(value);
}
