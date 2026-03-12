import api from './api';
import { User } from '../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface OtpPayload {
  email: string;
}

interface VerifyOtpPayload {
  email: string;
  otp: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  async sendOtp(payload: OtpPayload): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post('/auth/send-otp', payload);
    return data;
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
    const { data } = await api.post('/auth/verify-otp', payload);
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get('/user/profile');
    return data;
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    const { data } = await api.patch('/user/profile', payload);
    return data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
};
