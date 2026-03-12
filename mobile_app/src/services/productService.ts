import api from './api';
import { Product, Category, Banner, Review, ReviewStats, PaginatedResponse } from '../types';

interface ProductsParams {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating';
  featured?: boolean;
}

export const productService = {
  async getProducts(params: ProductsParams = {}): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get('/products', { params });
    return data;
  },

  async getProduct(idOrSlug: string): Promise<Product> {
    const { data } = await api.get(`/products/${idOrSlug}`);
    return data;
  },

  async searchProducts(query: string): Promise<Product[]> {
    const { data } = await api.get('/search', { params: { q: query } });
    return data;
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await api.get('/categories');
    return data;
  },

  async getCategoryProducts(
    slug: string,
    params: Omit<ProductsParams, 'categoryId'> = {}
  ): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get(`/categories/${slug}/products`, { params });
    return data;
  },

  async getBanners(position?: string): Promise<Banner[]> {
    const { data } = await api.get('/banners', { params: { position } });
    return data;
  },

  async getReviews(productId: string): Promise<{ reviews: Review[]; stats: ReviewStats }> {
    const { data } = await api.get('/reviews', { params: { productId } });
    return data;
  },

  async submitReview(payload: {
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
  }): Promise<Review> {
    const { data } = await api.post('/reviews', payload);
    return data;
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const { data } = await api.get('/products', {
      params: { featured: true, pageSize: 10 },
    });
    return data.data || data;
  },
};
