// Đường dẫn: services/auth.service.ts

import axiosClient from './axiosClient';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
} from '@/types/auth.type';

export const authService = {
  // Hàm đăng nhập
  login: (data: LoginRequest): Promise<AuthResponse> => {
    return axiosClient.post('/auth/login', data);
  },
  
  // Hàm đăng ký
  register: (data: RegisterRequest): Promise<string> => {
    return axiosClient.post('/auth/register', data);
  },

  // Hàm đổi mật khẩu
  changePassword: (data: ChangePasswordRequest): Promise<string> => {
    return axiosClient.post('/tai-khoan/doi-mat-khau', data);
  },

  // Hàm gửi OTP quên mật khẩu
  forgotPassword: (data: ForgotPasswordRequest): Promise<string> => {
    return axiosClient.post('/auth/forgot-password', data);
  },
  // Thêm vào file src/services/auth.service.ts của Frontend
  verifyOtp: async (data: { email: string; otp: string }) => {
    const response = await axiosClient.post('/auth/verify-otp', data);
    return response.data;
  },

  resetPassword: async (data: { email: string; otp: string; matKhauMoi: string }) => {
    const response = await axiosClient.post('/auth/reset-password', data);
    return response.data;
  },
};
