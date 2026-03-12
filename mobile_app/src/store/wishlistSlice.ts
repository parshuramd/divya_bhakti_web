import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../types';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';

interface WishlistState {
  items: Product[];
}

const initialState: WishlistState = {
  items: [],
};

function persistWishlist(items: Product[]) {
  storage.set(STORAGE_KEYS.WISHLIST, items);
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    loadWishlist(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
    },
    toggleWishlist(state, action: PayloadAction<Product>) {
      const exists = state.items.find((item) => item.id === action.payload.id);
      if (exists) {
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      } else {
        state.items.push(action.payload);
      }
      persistWishlist(state.items);
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      persistWishlist(state.items);
    },
    clearWishlist(state) {
      state.items = [];
      persistWishlist([]);
    },
  },
});

export const selectIsInWishlist = (productId: string) => (state: { wishlist: WishlistState }) =>
  state.wishlist.items.some((item) => item.id === productId);

export const { loadWishlist, toggleWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
