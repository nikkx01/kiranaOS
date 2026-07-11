// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CASHIER';
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  _count?: { products: number };
}

// ─── Product ──────────────────────────────────────────────────────────────────

export type ProductUnit = 'PCS' | 'KG' | 'G' | 'L' | 'ML' | 'PACK' | 'BOX' | 'DOZEN';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  categoryId?: string | null;
  sellingPrice: number;
  costPrice: number;
  stockQty: number;
  unit: ProductUnit;
  isActive: boolean;
  createdAt: string;
  category?: Pick<Category, 'id' | 'name'> | null;
}

export interface ProductFormData {
  name: string;
  sku: string;
  description?: string;
  categoryId?: string;
  sellingPrice: number;
  costPrice: number;
  stockQty: number;
  unit: ProductUnit;
}

// ─── Bill ─────────────────────────────────────────────────────────────────────

export type BillStatus = 'DRAFT' | 'COMPLETED' | 'CANCELLED';

export interface BillItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  subtotal: number;
  product?: Pick<Product, 'id' | 'name' | 'unit'>;
}

export interface Bill {
  id: string;
  billNumber: string;
  userId: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: BillStatus;
  notes?: string | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'name'>;
  items?: BillItem[];
  _count?: { items: number };
}

export interface CreateBillPayload {
  items: { productId: string; quantity: number }[];
  discount?: number;
  notes?: string;
}

// ─── Cart (client-side only) ──────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface ReportSummary {
  totalSales: number;
  totalProfit: number;
  totalBills: number;
  totalDiscount: number;
  averageBillValue: number;
}

export interface BestSeller {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

// ─── API Pagination ───────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
}
