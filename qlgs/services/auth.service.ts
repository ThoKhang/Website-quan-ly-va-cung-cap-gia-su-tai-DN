// Đường dẫn: services/auth.service.ts

import axiosClient from './axiosClient';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth.type';

export const authService = {
  // Hàm đăng nhập
  login: (data: LoginRequest): Promise<AuthResponse> => {
    return axiosClient.post('/auth/login', data);
  },
  
  // Hàm đăng ký
  register: (data: RegisterRequest): Promise<string> => { // Backend trả về chuỗi String
    return axiosClient.post('/auth/register', data);
  }
};