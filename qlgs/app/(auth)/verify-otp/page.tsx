"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy email từ bước forgot-password truyền sang
    const savedEmail = localStorage.getItem('resetEmail');
    if (!savedEmail) {
      router.push('/forgot-password'); // Nếu không có email thì đuổi về lại
    } else {
      setEmail(savedEmail);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length < 6) {
      setError('Vui lòng nhập đủ mã OTP');
      return;
    }

    setLoading(true);
    try {
      // ⚠️ GỌI API KIỂM TRA OTP (Khang cần đảm bảo Backend có API này)
      await authService.verifyOtp({ email, otp });
      
      // Nếu OTP đúng, lưu luôn mã OTP lại để mang sang trang reset-password
      localStorage.setItem('validOtp', otp);
      router.push('/reset-password');

    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nhập Mã Xác Nhận</h1>
          <p className="text-gray-600">Mã OTP đã được gửi đến email:<br/><span className="font-bold text-blue-600">{email}</span></p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Chỉ cho nhập số
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] font-bold focus:ring-2 focus:ring-orange-500"
              placeholder="------"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 disabled:bg-gray-400"
          >
            {loading ? 'Đang kiểm tra...' : 'Xác Nhận OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}