"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

// HÀM CHE EMAIL TRỰC TIẾP Ở FRONTEND (BẢO MẬT 2 LỚP)
const secureMaskEmail = (rawEmail: string) => {
  if (!rawEmail || !rawEmail.includes('@')) return rawEmail || 'email của bạn';
  
  // Nếu Backend đã che sẵn (có dấu *) thì dùng luôn
  if (rawEmail.includes('*')) return rawEmail;

  // Nếu Backend vô tình gửi full email, Frontend sẽ tự che
  const [name, domain] = rawEmail.split('@');
  const maskedName = name.length > 3 
    ? name.substring(0, 3) + '***' 
    : name.substring(0, 1) + '***';
    
  return `${maskedName}@${domain}`;
};

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  
  const [identifier, setIdentifier] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy Identifier và Email từ bước trước
    const savedIdentifier = localStorage.getItem('resetIdentifier');
    const savedEmailData = localStorage.getItem('maskedEmail');
    
    if (!savedIdentifier) {
      router.push('/forgot-password'); 
    } else {
      setIdentifier(savedIdentifier);
      // Đưa qua hàm che để đảm bảo an toàn tuyệt đối
      setMaskedEmail(secureMaskEmail(savedEmailData || ''));
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
      await authService.verifyOtp({ identifier, otp });
      
      localStorage.setItem('validOtp', otp);
      router.push('/reset-password');

    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  if (!identifier) return null; 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nhập Mã Xác Nhận</h1>
          <p className="text-gray-600">
            Mã OTP đã được gửi đến địa chỉ email:<br/>
            {/* Hiển thị email đã được che an toàn */}
            <span className="font-bold text-orange-600 text-lg tracking-wide inline-block mt-1">
              {maskedEmail}
            </span>
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm text-center font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-3xl tracking-[0.5em] font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
              placeholder="------"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className={`w-full py-3 text-white rounded-lg font-bold transition-all flex justify-center items-center gap-2 ${
              loading || otp.length < 6 ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Đang kiểm tra...
              </>
            ) : 'Xác Nhận OTP'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-500">
          Chưa nhận được mã?{' '}
          <button 
            onClick={() => router.push('/forgot-password')} 
            className="text-orange-600 hover:underline font-semibold"
          >
            Thử lại
          </button>
        </p>
      </div>
    </div>
  );
}