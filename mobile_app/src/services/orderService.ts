import api from './api';
import { Order, Address, Coupon } from '../types';

interface CreateOrderPayload {
  addressId: string;
  items: { productId: string; quantity: number }[];
  couponCode?: string;
  notes?: string;
}

interface RazorpayOrderResponse {
  success: boolean;
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

export const orderService = {
  async createCodOrder(
    payload: CreateOrderPayload
  ): Promise<{ success: boolean; orderId: string; orderNumber: string }> {
    const { data } = await api.post('/orders/cod', payload);
    return data;
  },

  async createRazorpayOrder(payload: CreateOrderPayload): Promise<RazorpayOrderResponse> {
    const { data } = await api.post('/razorpay/create-order', payload);
    return data;
  },

  async verifyPayment(
    payload: VerifyPaymentPayload
  ): Promise<{ success: boolean; message: string; orderId: string; orderNumber: string }> {
    const { data } = await api.post('/razorpay/verify', payload);
    return data;
  },

  async getOrders(): Promise<Order[]> {
    const { data } = await api.get('/user/orders');
    return data;
  },

  async getOrderDetail(id: string): Promise<Order> {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  async trackOrder(
    orderNumber: string,
    email: string
  ): Promise<Order> {
    const { data } = await api.get('/orders/track', {
      params: { orderNumber, email },
    });
    return data;
  },

  async getAddresses(): Promise<Address[]> {
    const { data } = await api.get('/addresses');
    return data;
  },

  async createAddress(payload: Omit<Address, 'id' | 'userId'>): Promise<Address> {
    const { data } = await api.post('/addresses', payload);
    return data;
  },

  async updateAddress(id: string, payload: Partial<Address>): Promise<Address> {
    const { data } = await api.put(`/addresses/${id}`, payload);
    return data;
  },

  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/addresses/${id}`);
  },

  async applyCoupon(
    code: string,
    subtotal: number
  ): Promise<{ success: boolean; coupon: Coupon }> {
    const { data } = await api.post('/coupons/apply', { code, subtotal });
    return data;
  },
};
