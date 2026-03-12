export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  image: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  emailVerified: string | null;
}

export interface Category {
  id: string;
  name: string;
  nameMarathi: string | null;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  nameMarathi: string | null;
  slug: string;
  description: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  weight: number | null;
  dimensions: string | null;
  categoryId: string;
  category?: Category;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  reviews?: Review[];
  _count?: { reviews: number };
  averageRating?: number;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  isApproved: boolean;
  user?: { name: string; image: string | null };
  createdAt: string;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: 'HOME' | 'OFFICE' | 'OTHER';
  isDefault: boolean;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentMethod = 'COD' | 'RAZORPAY' | 'UPI' | 'CARD' | 'NETBANKING';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  product?: Product;
}

export interface OrderTimeline {
  id: string;
  status: OrderStatus;
  message: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  notes: string | null;
  trackingUrl: string | null;
  awbNumber: string | null;
  items: OrderItem[];
  address: Address;
  timeline?: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  imageMobile: string | null;
  link: string | null;
  linkText: string | null;
  position: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Coupon {
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: string;
}
