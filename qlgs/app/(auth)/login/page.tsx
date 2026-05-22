// Đường dẫn: app/(auth)/login/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { LoginRequest } from '@/types/auth.type';
import { useAuthStore } from '@/store/auth.store';

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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<LoginRequest>({
    tenDangNhap: '',
    matKhau: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
      setMessageType('success');
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.tenDangNhap.trim()) {
      newErrors.tenDangNhap = 'Vui lòng nhập tên đăng nhập hoặc email';
    }

    if (!formData.matKhau) {
      newErrors.matKhau = 'Vui lòng nhập mật khẩu';
    } else if (formData.matKhau.length < 6) {
      newErrors.matKhau = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(formData);

      const token = response.token?.toString() || '';
      const loaiNguoiDungID = response.loaiNguoiDungID?.toString() || '';
      const idNguoiDung = response.idNguoiDung?.toString() || '';

      // Kiểm tra dữ liệu hợp lệ
      if (!token || !loaiNguoiDungID || !idNguoiDung) {
        throw new Error('Phản hồi từ máy chủ không hợp lệ. Vui lòng thử lại.');
      }

      // Lưu vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('tenDangNhap', formData.tenDangNhap);
      localStorage.setItem('loaiNguoiDungID', loaiNguoiDungID);
      localStorage.setItem('idNguoiDung', idNguoiDung);
      
      // Lưu ID tương ứng với loại tài khoản
      if (loaiNguoiDungID === '1') {
        // Phụ huynh
        localStorage.setItem('idPhuHuynh', idNguoiDung);
      } else if (loaiNguoiDungID === '2') {
        // Gia sư
        localStorage.setItem('idGiaSu', idNguoiDung);
      }

      // Cập nhật auth store
      useAuthStore.getState().setAuth(token, formData.tenDangNhap, loaiNguoiDungID, idNguoiDung);

      setMessage('Đăng nhập thành công! Đang chuyển hướng...');
      setMessageType('success');

      const roleId = loaiNguoiDungID;
      setTimeout(() => {
        switch (roleId) {
          case '1':
            // Phụ huynh: chuyển đến trang chủ
            router.push('/');
            break;
          case '2':
            // Gia sư: chuyển đến trang quản lý gia sư
            router.push('/gia-su/khoa-hoc');
            break;
          case '3':
            // Nhân viên: chuyển đến trang nhân viên
            router.push('/nhan-vien');
            break;
          case '4':
            // Admin: chuyển đến trang admin
            router.push('/admin/dashboard');
            break;
          default:
            // Mặc định: chuyển đến trang chủ
            router.push('/');
        }
      }, 1500);
    } catch (err: any) {
      setMessageType('error');
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng Nhập</h1>
          <p className="text-gray-600">Quản lý và cung cấp gia sư tại Đà Nẵng</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {messageType === 'success' ? (
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <p className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username/Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập / Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="tenDangNhap"
                  value={formData.tenDangNhap}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.tenDangNhap ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên đăng nhập hoặc email"
                />
                {errors.tenDangNhap && (
                  <p className="mt-1 text-sm text-red-600">{errors.tenDangNhap}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="matKhau"
                  value={formData.matKhau}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.matKhau ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M15.171 13.576l1.414 1.414a1 1 0 001.414-1.414l-1.414-1.414m2.121-2.121l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414m-5.59-5.59l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414" />
                    </svg>
                  )}
                </button>
                {errors.matKhau && (
                  <p className="mt-1 text-sm text-red-600">{errors.matKhau}</p>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                <span className="text-gray-600">Ghi nhớ tôi</span>
              </label>
              <a href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">hoặc</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Register Link */}
          <p className="text-center text-gray-600">
            Chưa có tài khoản?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Đăng ký ngay
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2024 Quản lý và cung cấp gia sư. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    </div>}>
      <LoginContent />
    </Suspense>
  );
}
