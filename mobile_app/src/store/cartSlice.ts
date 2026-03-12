import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product, Coupon } from '../types';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, CONFIG } from '../constants';

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  isLoading: boolean;
}

const initialState: CartState = {
  items: [],
  coupon: null,
  isLoading: false,
};

function persistCart(items: CartItem[]) {
  storage.set(STORAGE_KEYS.CART, items);
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    loadCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    addToCart(state, action: PayloadAction<{ product: Product; quantity?: number }>) {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((item) => item.productId === product.id);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      } else {
        state.items.push({
          productId: product.id,
          product,
          quantity: Math.min(quantity, product.stock),
        });
      }
      persistCart(state.items);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.productId !== action.payload);
      persistCart(state.items);
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        item.quantity = Math.max(1, Math.min(action.payload.quantity, item.product.stock));
      }
      persistCart(state.items);
    },
    incrementQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.productId === action.payload);
      if (item && item.quantity < item.product.stock) {
        item.quantity += 1;
      }
      persistCart(state.items);
    },
    decrementQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.productId === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
      persistCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      state.coupon = null;
      persistCart([]);
    },
    applyCoupon(state, action: PayloadAction<Coupon>) {
      state.coupon = action.payload;
    },
    removeCoupon(state) {
      state.coupon = null;
    },
  },
});

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
export const selectCartDiscount = (state: { cart: CartState }) => {
  const coupon = state.cart.coupon;
  if (!coupon) return 0;
  return coupon.discountAmount;
};
export const selectShippingCost = (state: { cart: CartState }) => {
  const subtotal = state.cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  return subtotal >= CONFIG.SHIPPING_FREE_ABOVE ? 0 : CONFIG.SHIPPING_COST;
};
export const selectCartTotal = (state: { cart: CartState }) => {
  const subtotal = state.cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal >= CONFIG.SHIPPING_FREE_ABOVE ? 0 : CONFIG.SHIPPING_COST;
  const discount = state.cart.coupon?.discountAmount || 0;
  return Math.max(0, subtotal + shipping - discount);
};

export const {
  loadCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;
