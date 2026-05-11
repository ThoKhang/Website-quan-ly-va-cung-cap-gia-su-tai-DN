// Đường dẫn: services/auth.service.ts

import axiosClient from './axiosClient';
import { LoginRequest, RegisterRequest, AuthResponse, ChangePasswordRequest } from '@/types/auth.type';

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
  }
};