import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Product, Category, Banner } from '../types';
import { productService } from '../services/productService';

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  categories: Category[];
  banners: Banner[];
  currentProduct: Product | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  searchResults: Product[];
  isSearching: boolean;
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  categories: [],
  banners: [],
  currentProduct: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  page: 1,
  totalPages: 1,
  searchResults: [],
  isSearching: false,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (
    params: {
      page?: number;
      categoryId?: string;
      sort?: string;
      search?: string;
      append?: boolean;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await productService.getProducts({
        page: params.page || 1,
        categoryId: params.categoryId,
        sort: params.sort as any,
        search: params.search,
      });
      return { ...response, append: params.append };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to load products');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getFeaturedProducts();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to load featured products');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getCategories();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to load categories');
    }
  }
);

export const fetchBanners = createAsyncThunk(
  'products/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getBanners('HOME_HERO');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to load banners');
    }
  }
);

export const fetchProductDetail = createAsyncThunk(
  'products/fetchDetail',
  async (idOrSlug: string, { rejectWithValue }) => {
    try {
      return await productService.getProduct(idOrSlug);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to load product');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/search',
  async (query: string, { rejectWithValue }) => {
    try {
      return await productService.searchProducts(query);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Search failed');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProducts(state) {
      state.products = [];
      state.page = 1;
      state.totalPages = 1;
    },
    clearSearch(state) {
      state.searchResults = [];
      state.isSearching = false;
    },
    clearCurrentProduct(state) {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Products
      .addCase(fetchProducts.pending, (state, action) => {
        if (action.meta.arg?.append) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const { data, totalPages, page } = action.payload;
        state.isLoading = false;
        state.isLoadingMore = false;
        state.products = action.payload.append ? [...state.products, ...data] : data;
        state.page = page;
        state.totalPages = totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload as string;
      })
      // Featured
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      })
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Banners
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.banners = action.payload;
      })
      // Product detail
      .addCase(fetchProductDetail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search
      .addCase(searchProducts.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProducts.rejected, (state) => {
        state.isSearching = false;
      });
  },
});

export const { clearProducts, clearSearch, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
