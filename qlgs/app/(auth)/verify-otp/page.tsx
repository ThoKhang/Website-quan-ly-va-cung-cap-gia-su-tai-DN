"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  // Chúng ta cần 2 biến: identifier để gửi cho Backend, và maskedEmail để show cho người dùng xem
  const [identifier, setIdentifier] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy Identifier và Email đã che từ bước forgot-password truyền sang
    const savedIdentifier = localStorage.getItem('resetIdentifier');
    const savedMaskedEmail = localStorage.getItem('maskedEmail');
    
    if (!savedIdentifier) {
      router.push('/forgot-password'); // Đuổi về nếu không có dữ liệu
    } else {
      setIdentifier(savedIdentifier);
      setMaskedEmail(savedMaskedEmail || 'email của bạn');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length < 6) {
      setError('Vui lòng nhập đủ 6 số mã OTP');
      return;
    }

    setLoading(true);
    try {
      // GỌI API KIỂM TRA OTP bằng identifier (Không gửi maskedEmail vì Backend đâu có hiểu)
      await authService.verifyOtp({ identifier, otp });
      
      // Nếu OTP đúng, lưu luôn mã OTP lại để mang sang trang reset-password
      localStorage.setItem('validOtp', otp);
      router.push('/reset-password');

    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  if (!identifier) return null; // Chống chớp giao diện

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nhập Mã Xác Nhận</h1>
          <p className="text-gray-600">
            Mã OTP đã được gửi đến email:<br/>
            {/* Hiển thị email đã che để bảo mật */}
            <span className="font-bold text-orange-600 text-lg tracking-wide">{maskedEmail}</span>
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Chỉ cho nhập số
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-3xl tracking-[0.5em] font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
              placeholder="------"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Đang kiểm tra...' : 'Xác Nhận OTP'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-500">
          Chưa nhận được mã? <a href="/forgot-password" className="text-orange-600 hover:underline">Gửi lại</a>
        </p>
      </div>
    </div>
  );
}