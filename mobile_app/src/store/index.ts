export { store, useAppDispatch, useAppSelector } from './store';
export type { RootState, AppDispatch } from './store';

export {
  initializeAuth,
  login,
  register,
  updateProfile,
  logout,
  clearError,
  setUser,
} from './authSlice';

export {
  loadCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
  selectCartItems,
  selectCartItemCount,
  selectCartSubtotal,
  selectCartDiscount,
  selectShippingCost,
  selectCartTotal,
} from './cartSlice';

export {
  fetchProducts,
  fetchFeaturedProducts,
  fetchCategories,
  fetchBanners,
  fetchProductDetail,
  searchProducts,
  clearProducts,
  clearSearch,
  clearCurrentProduct,
} from './productSlice';

export {
  loadWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
  selectIsInWishlist,
} from './wishlistSlice';

export { setThemeMode, loadTheme } from './themeSlice';
