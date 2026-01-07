import { z } from 'zod';

// ============= Auth Schemas =============

export const emailSchema = z.string().email('Please enter a valid email address').toLowerCase();

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number');

export const pincodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit PIN code');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: emailSchema,
    phone: phoneSchema.optional(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const otpRequestSchema = z.object({
  email: emailSchema,
});

export const otpVerifySchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

// ============= Address Schemas =============

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema,
  addressLine1: z.string().min(5, 'Address must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: pincodeSchema,
  country: z.string().default('India'),
  type: z.enum(['HOME', 'OFFICE', 'OTHER']).default('HOME'),
  isDefault: z.boolean().default(false),
});

// ============= Product Schemas =============

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  nameMarathi: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  descriptionMarathi: z.string().optional(),
  shortDescription: z.string().max(200, 'Short description must be less than 200 characters').optional(),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  costPrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  weight: z.coerce.number().positive().optional().nullable(),
  dimensions: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional()
    .nullable(),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().max(60, 'Meta title must be less than 60 characters').optional(),
  metaDescription: z.string().max(160, 'Meta description must be less than 160 characters').optional(),
});

export const productImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

// ============= Category Schemas =============

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  nameMarathi: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url('Invalid image URL').optional().nullable(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

// ============= Cart Schemas =============

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
});

// ============= Order Schemas =============

export const orderSchema = z.object({
  addressId: z.string().min(1, 'Address is required'),
  paymentMethod: z.enum(['COD', 'RAZORPAY']),
  couponCode: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
    'REFUNDED',
  ]),
  message: z.string().optional(),
});

// ============= Coupon Schemas =============

export const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.coerce.number().positive('Discount value must be positive'),
  minOrderAmount: z.coerce.number().positive().optional().nullable(),
  maxDiscount: z.coerce.number().positive().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  startsAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').toUpperCase(),
});

// ============= Review Schemas =============

export const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.coerce.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  comment: z.string().max(1000, 'Comment must be less than 1000 characters').optional(),
});

// ============= Banner Schemas =============

export const bannerSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  titleMarathi: z.string().optional(),
  subtitle: z.string().optional(),
  subtitleMarathi: z.string().optional(),
  image: z.string().url('Invalid image URL'),
  imageMobile: z.string().url('Invalid image URL').optional().nullable(),
  link: z.string().optional(),
  linkText: z.string().optional(),
  position: z.enum(['HOME_HERO', 'HOME_SECONDARY', 'CATEGORY_PAGE', 'PRODUCT_PAGE', 'CHECKOUT_PAGE']),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
});

// ============= Contact Schemas =============

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
});

// ============= Page Schemas =============

export const pageSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  titleMarathi: z.string().optional(),
  slug: z.string().optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  contentMarathi: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  isPublished: z.boolean().default(false),
});

// ============= Announcement Schemas =============

export const announcementSchema = z.object({
  message: z.string().min(5, 'Message must be at least 5 characters'),
  messageMarathi: z.string().optional(),
  link: z.string().url().optional().nullable(),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').default('#f97316'),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').default('#ffffff'),
  isActive: z.boolean().default(true),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
});

// ============= Profile Schemas =============

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema.optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ============= Search Schemas =============

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  category: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'popularity']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

// ============= Type Exports =============

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type PageInput = z.infer<typeof pageSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SearchInput = z.infer<typeof searchSchema>;

