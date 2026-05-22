"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  
  const [formData, setFormData] = useState({ matKhauMoi: '', xacNhanMatKhau: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });

  useEffect(() => {
    // Lấy Identifier và OTP hợp lệ từ 2 bước trước truyền sang
    const savedIdentifier = localStorage.getItem('resetIdentifier');
    const savedOtp = localStorage.getItem('validOtp');

    if (!savedIdentifier || !savedOtp) {
      // Bắt quả tang ai đó gõ URL nhảy cóc -> Đuổi về
      router.push('/forgot-password');
    } else {
      setIdentifier(savedIdentifier);
      setOtp(savedOtp);
    }
  }, [router]);

  const validateForm = () => {
    if (!formData.matKhauMoi || formData.matKhauMoi.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return false;
    }
    if (formData.matKhauMoi !== formData.xacNhanMatKhau) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Gọi API đặt lại mật khẩu với IDENTIFIER
      await authService.resetPassword({
        identifier: identifier,
        otp: otp,
        matKhauMoi: formData.matKhauMoi
      });

      setSuccess('Đặt lại mật khẩu thành công! Đang chuyển hướng đến đăng nhập...');
      
      // Bẻ khóa an toàn: Xóa sạch dấu vết
      localStorage.removeItem('resetIdentifier');
      localStorage.removeItem('validOtp');
      localStorage.removeItem('maskedEmail'); // Dọn luôn cái email đã che

      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (!identifier || !otp) return null; 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt Lại Mật Khẩu</h1>
          <p className="text-gray-600">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        {error && <div className="mb-5 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm text-center font-medium">{error}</div>}
        {success && <div className="mb-5 p-3 bg-green-50 text-green-800 border border-green-200 rounded-lg text-sm text-center font-medium">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mật khẩu mới */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="matKhauMoi"
                value={formData.matKhauMoi}
                onChange={handleChange}
                disabled={success !== ''}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition ${error.includes('Mật khẩu mới') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder="Tối thiểu 6 ký tự"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="xacNhanMatKhau"
                value={formData.xacNhanMatKhau}
                onChange={handleChange}
                disabled={success !== ''}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition ${error.includes('khớp') ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder="Nhập lại mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success !== ''}
            className={`w-full py-3 text-white rounded-lg font-bold transition-all flex justify-center items-center gap-2 ${
              loading || success !== '' ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Đang lưu...
              </>
            ) : 'Xác Nhận Đổi Mật Khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}