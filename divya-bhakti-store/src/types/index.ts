import { UserRole, OrderStatus, PaymentMethod, PaymentStatus, DiscountType, AddressType } from '@prisma/client';

// ============= User Types =============

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
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
  isDefault: boolean;
  type: AddressType;
}

// ============= Product Types =============

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
  _count?: {
    products: number;
  };
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  nameMarathi: string | null;
  slug: string;
  description: string | null;
  descriptionMarathi: string | null;
  shortDescription: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  weight: number | null;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
  } | null;
  categoryId: string;
  category?: Category;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    reviews: number;
  };
  averageRating?: number;
}

export interface ProductWithRelations extends Product {
  category: Category;
  reviews?: Review[];
}

// ============= Cart Types =============

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ============= Order Types =============

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

export interface OrderTimeline {
  id: string;
  orderId: string;
  status: OrderStatus;
  message: string | null;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  addressId: string;
  address?: Address;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponId: string | null;
  coupon?: Coupon;
  notes: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  shiprocketOrderId: string | null;
  shiprocketShipmentId: string | null;
  awbNumber: string | null;
  trackingUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  items: OrderItem[];
  timeline?: OrderTimeline[];
}

// ============= Coupon Types =============

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

// ============= Review Types =============

export interface Review {
  id: string;
  userId: string;
  user?: User;
  productId: string;
  product?: Product;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
}

// ============= CMS Types =============

export interface Banner {
  id: string;
  title: string;
  titleMarathi: string | null;
  subtitle: string | null;
  subtitleMarathi: string | null;
  image: string;
  imageMobile: string | null;
  link: string | null;
  linkText: string | null;
  position: 'HOME_HERO' | 'HOME_SECONDARY' | 'CATEGORY_PAGE' | 'PRODUCT_PAGE' | 'CHECKOUT_PAGE';
  isActive: boolean;
  sortOrder: number;
  startsAt: Date | null;
  endsAt: Date | null;
}

export interface Announcement {
  id: string;
  message: string;
  messageMarathi: string | null;
  link: string | null;
  bgColor: string;
  textColor: string;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
}

export interface Page {
  id: string;
  title: string;
  titleMarathi: string | null;
  slug: string;
  content: string;
  contentMarathi: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
}

// ============= API Response Types =============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============= Filter Types =============

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popularity' | 'name_asc' | 'name_desc';
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
}

// ============= Dashboard Types =============

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: Order[];
  topProducts: Array<{
    product: Product;
    totalSold: number;
    revenue: number;
  }>;
}

// ============= Razorpay Types =============

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// ============= Shiprocket Types =============

export interface ShiprocketOrder {
  order_id: number;
  shipment_id: number;
  status: string;
  awb_code: string;
  courier_name: string;
  pickup_scheduled_date: string;
  pickup_token_number: string;
}

export interface ShiprocketTrackingResponse {
  tracking_data: {
    track_status: number;
    shipment_status: string;
    shipment_track: Array<{
      id: number;
      activity: string;
      date: string;
      location: string;
    }>;
    shipment_track_activities: Array<{
      date: string;
      status: string;
      activity: string;
      location: string;
    }>;
  };
}

// ============= Session Types =============

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      image: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    image: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: string;
    image: string;
  }
}

