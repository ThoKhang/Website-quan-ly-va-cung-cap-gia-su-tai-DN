// Đường dẫn: app/(auth)/login/page.tsx
"use client"; // Bắt buộc phải có dòng này để dùng useState và các event onClick

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { LoginRequest } from '@/types/auth.type';

function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "response" in error) {
    const response = error.response;
    if (response && typeof response === "object" && "data" in response) {
      const data = response.data;
      if (typeof data === "string") {
        return data;
      }
    }
  }

  return "Đăng nhập thất bại, vui lòng thử lại!";
}

export default function LoginPage() {
  const router = useRouter(); // Dùng để chuyển trang
  const [formData, setFormData] = useState<LoginRequest>({
    tenDangNhap: '',
    matKhau: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Hàm bắt sự kiện khi gõ phím
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Hàm xử lý khi bấm nút Đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Chặn hành vi load lại trang mặc định của form
    setError('');
    setLoading(true);

    try {
      // 1. Gọi API qua Service
      const response = await authService.login(formData);

      // 2. Lưu thông tin vào LocalStorage để dùng về sau
      localStorage.setItem('token', response.token);
      localStorage.setItem('loaiNguoiDungID', response.loaiNguoiDungID);
      localStorage.setItem('idNguoiDung', response.idNguoiDung);

      // 3. Chuyển trang dựa theo Role (1: Phụ huynh, 2: Gia sư, 3: Admin)
      if (response.loaiNguoiDungID === '1') {
        router.push('/phu-huynh/dashboard'); // Đổi thành URL trang chủ phụ huynh của bạn
      } else if (response.loaiNguoiDungID === '2') {
        router.push('/gia-su/dashboard');    // Đổi thành URL trang chủ gia sư của bạn
      } else {
        router.push('/'); 
      }

    } catch (err: unknown) {
      // Bắt lỗi từ Backend trả về (Ví dụ: "Mật khẩu không chính xác!")
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng Nhập</h2>
        
        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập / Email
            </label>
            <input
              type="text"
              name="tenDangNhap"
              value={formData.tenDangNhap}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên đăng nhập hoặc email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              name="matKhau"
              value={formData.matKhau}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Chưa có tài khoản?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}
