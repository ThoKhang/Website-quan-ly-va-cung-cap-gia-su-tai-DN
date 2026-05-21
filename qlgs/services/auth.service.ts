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

  // Hàm gửi OTP cho đổi mật khẩu
  sendChangePasswordOtp: (): Promise<string> => {
    return axiosClient.post('/tai-khoan/send-change-password-otp', {});
  },

  // Hàm xác nhận OTP cho đổi mật khẩu
  verifyChangePasswordOtp: (data: { otp: string }): Promise<string> => {
    return axiosClient.post('/tai-khoan/verify-change-password-otp', data);
  },

  // Hàm đổi mật khẩu
  changePassword: (data: ChangePasswordRequest): Promise<string> => {
    return axiosClient.post('/tai-khoan/doi-mat-khau', data);
  },

  forgotPassword: (data: { identifier: string }): Promise<string> => {
      return axiosClient.post('/auth/forgot-password', data);
    },
  verifyOtp: (data: { identifier: string; otp: string }): Promise<any> => {
      return axiosClient.post('/auth/verify-otp', data);
    },
  resetPassword: (data: { identifier: string; otp: string; matKhauMoi: string }): Promise<any> => {
      return axiosClient.post('/auth/reset-password', data);
    }
};

