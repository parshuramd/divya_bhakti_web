import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const CONFIG = {
  API_BASE_URL: extra.apiBaseUrl || 'https://your-domain.com/api',
  RAZORPAY_KEY_ID: extra.razorpayKeyId || 'rzp_test_xxxxxxxxxxxxx',
  APP_NAME: 'Divya Bhakti Store',
  SUPPORT_EMAIL: 'support@divyabhaktistore.com',
  SUPPORT_PHONE: '+91-9999999999',
  WHATSAPP_NUMBER: '+919999999999',
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',
  SHIPPING_FREE_ABOVE: 499,
  SHIPPING_COST: 49,
  DEFAULT_PAGE_SIZE: 20,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER: '@user_data',
  CART: '@cart_items',
  WISHLIST: '@wishlist_items',
  THEME: '@app_theme',
  ONBOARDING: '@onboarding_complete',
  RECENT_SEARCHES: '@recent_searches',
  FCM_TOKEN: '@fcm_token',
} as const;

export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'Pending', color: '#F59E0B', icon: 'clock-outline' },
  CONFIRMED: { label: 'Confirmed', color: '#3B82F6', icon: 'check-circle-outline' },
  PROCESSING: { label: 'Processing', color: '#8B5CF6', icon: 'cog-outline' },
  PACKED: { label: 'Packed', color: '#6366F1', icon: 'package-variant-closed' },
  SHIPPED: { label: 'Shipped', color: '#0EA5E9', icon: 'truck-delivery-outline' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: '#14B8A6', icon: 'map-marker-radius-outline' },
  DELIVERED: { label: 'Delivered', color: '#22C55E', icon: 'check-decagram' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', icon: 'close-circle-outline' },
  RETURNED: { label: 'Returned', color: '#F97316', icon: 'keyboard-return' },
  REFUNDED: { label: 'Refunded', color: '#A855F7', icon: 'cash-refund' },
};
