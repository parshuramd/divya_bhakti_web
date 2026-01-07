import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, AppliedCoupon } from '@/types';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  isOpen: boolean;
  
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getItem: (productId: string) => CartItem | undefined;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isOpen: false,

      addItem: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id);
          
          if (existingItem) {
            // Update quantity if item exists
            const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            };
          }
          
          // Add new item
          return {
            items: [
              ...state.items,
              {
                id: `cart-${product.id}-${Date.now()}`,
                product,
                quantity: Math.min(quantity, product.stock),
              },
            ],
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.product.id !== productId),
            };
          }

          return {
            items: state.items.map((item) =>
              item.product.id === productId
                ? { ...item, quantity: Math.min(quantity, item.product.stock) }
                : item
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [], coupon: null });
      },

      applyCoupon: (coupon: AppliedCoupon) => {
        set({ coupon });
      },

      removeCoupon: () => {
        set({ coupon: null });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + Number(item.product.price) * item.quantity,
          0
        );
      },

      getDiscount: () => {
        const { coupon } = get();
        if (!coupon) return 0;
        return coupon.discountAmount;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        return Math.max(0, subtotal - discount);
      },

      getItem: (productId: string) => {
        return get().items.find((item) => item.product.id === productId);
      },

      isInCart: (productId: string) => {
        return get().items.some((item) => item.product.id === productId);
      },
    }),
    {
      name: 'divya-bhakti-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
      }),
    }
  )
);

// Wishlist Store
interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) {
            return state;
          }
          return { items: [...state.items, product] };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      toggleItem: (product: Product) => {
        const { items, addItem, removeItem } = get();
        if (items.some((item) => item.id === product.id)) {
          removeItem(product.id);
        } else {
          addItem(product);
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'divya-bhakti-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Recently Viewed Store
interface RecentlyViewedState {
  items: Product[];
  addItem: (product: Product) => void;
  clearItems: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product: Product) => {
        set((state) => {
          // Remove if already exists
          const filtered = state.items.filter((item) => item.id !== product.id);
          // Add to beginning and limit to 10 items
          return { items: [product, ...filtered].slice(0, 10) };
        });
      },

      clearItems: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'divya-bhakti-recently-viewed',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

