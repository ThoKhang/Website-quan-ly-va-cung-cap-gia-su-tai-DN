"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';

type Step = 'password' | 'otp' | 'confirm';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('password');
  const [formData, setFormData] = useState({
    matKhauCu: '',
    matKhauMoi: '',
    xacNhanMatKhau: '',
    otp: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [maskedEmail, setMaskedEmail] = useState('');

  const validatePasswordForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.matKhauCu.trim()) {
      newErrors.matKhauCu = 'Vui lòng nhập mật khẩu cũ';
    }

    if (!formData.matKhauMoi) {
      newErrors.matKhauMoi = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.matKhauMoi.length < 6) {
      newErrors.matKhauMoi = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (formData.matKhauMoi !== formData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp';
    }

    if (formData.matKhauCu === formData.matKhauMoi) {
      newErrors.matKhauMoi = 'Mật khẩu mới phải khác mật khẩu cũ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtpForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.otp.trim()) {
      newErrors.otp = 'Vui lòng nhập mã OTP';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'Mã OTP phải có 6 chữ số';
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
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!validatePasswordForm()) {
      return;
    }

    setLoading(true);

    try {
      const email = await authService.sendChangePasswordOtp();
      setMaskedEmail(email);
      setStep('otp');
      setMessage('');
    } catch (err: any) {
      if (err.response?.data) {
        setMessage(err.response.data);
      } else if (err.message) {
        setMessage(err.message);
      } else {
        setMessage('Không thể gửi mã OTP, vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!validateOtpForm()) {
      return;
    }

    setLoading(true);

    try {
      await authService.verifyChangePasswordOtp({ otp: formData.otp });
      setStep('confirm');
      setMessage('');
    } catch (err: any) {
      if (err.response?.data) {
        setMessage(err.response.data);
      } else if (err.message) {
        setMessage(err.message);
      } else {
        setMessage('Mã OTP không chính xác, vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    setLoading(true);

    try {
      // Gửi toàn bộ formData bao gồm OTP
      const response = await authService.changePassword({
        matKhauCu: formData.matKhauCu,
        matKhauMoi: formData.matKhauMoi,
        xacNhanMatKhau: formData.xacNhanMatKhau,
        otp: formData.otp,
      });
      
      // Hiển thị thông báo thành công
      setMessage('Đổi mật khẩu thành công! Đang chuyển hướng...');
      setFormData({
        matKhauCu: '',
        matKhauMoi: '',
        xacNhanMatKhau: '',
        otp: '',
      });
      
      // Redirect sau 2 giây
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      if (err.response?.data) {
        setMessage(err.response.data);
      } else if (err.message) {
        setMessage(err.message);
      } else {
        setMessage('Đổi mật khẩu thất bại, vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; width: string } => {
    if (!password) return { strength: '', color: '', width: '0%' };
    if (password.length < 6) return { strength: 'Yếu', color: 'bg-red-500', width: '33%' };
    if (password.length < 10) return { strength: 'Trung bình', color: 'bg-yellow-500', width: '66%' };
    return { strength: 'Mạnh', color: 'bg-green-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(formData.matKhauMoi);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Đổi Mật Khẩu</h1>
          <p className="text-gray-600 text-lg">
            {step === 'password' && 'Nhập mật khẩu cũ và mật khẩu mới'}
            {step === 'otp' && 'Xác nhận bằng mã OTP'}
            {step === 'confirm' && 'Hoàn tất đổi mật khẩu'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          <div className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${step === 'password' || step === 'otp' || step === 'confirm' ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${step === 'otp' || step === 'confirm' ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${step === 'confirm' ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gray-200'}`}></div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 backdrop-blur-sm">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              message.includes('thành công') || message.includes('hợp lệ')
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              {message.includes('thành công') || message.includes('hợp lệ') ? (
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <p className={`text-sm font-medium ${message.includes('thành công') || message.includes('hợp lệ') ? 'text-green-800' : 'text-red-800'}`}>
                {message}
              </p>
            </div>
          )}

          {/* Step 1: Password */}
          {step === 'password' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              {/* Mật khẩu cũ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu cũ
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.old ? 'text' : 'password'}
                    name="matKhauCu"
                    value={formData.matKhauCu}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                      errors.matKhauCu ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                    placeholder="Nhập mật khẩu cũ"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.old ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.matKhauCu && (
                  <p className="mt-1 text-sm text-red-600">{errors.matKhauCu}</p>
                )}
              </div>

              {/* Mật khẩu mới */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="matKhauMoi"
                    value={formData.matKhauMoi}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                      errors.matKhauMoi ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                {formData.matKhauMoi && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Độ mạnh mật khẩu:</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength.color === 'bg-red-500' ? 'text-red-600' :
                        passwordStrength.color === 'bg-yellow-500' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${passwordStrength.color}`} style={{ width: passwordStrength.width }}></div>
                    </div>
                  </div>
                )}
                {errors.matKhauMoi && (
                  <p className="mt-1 text-sm text-red-600">{errors.matKhauMoi}</p>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="xacNhanMatKhau"
                    value={formData.xacNhanMatKhau}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
                      errors.xacNhanMatKhau ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    }`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.xacNhanMatKhau && (
                  <p className="mt-1 text-sm text-red-600">{errors.xacNhanMatKhau}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  'Tiếp Tục'
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">Mã OTP đã được gửi đến:</p>
                <p className="font-bold text-orange-600 text-lg">{maskedEmail}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập mã OTP (6 chữ số)
                </label>
                <input
                  type="text"
                  name="otp"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleChange({ ...e, target: { ...e.target, name: 'otp', value } } as any);
                  }}
                  className={`w-full px-4 py-3 border rounded-lg text-center text-3xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.otp ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="------"
                />
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || formData.otp.length !== 6}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  loading || formData.otp.length !== 6
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang kiểm tra...
                  </>
                ) : (
                  'Xác Nhận OTP'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('password');
                  setFormData(prev => ({ ...prev, otp: '' }));
                  setErrors({});
                }}
                className="w-full py-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← Quay lại
              </button>
            </form>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <form onSubmit={handleConfirmPassword} className="space-y-5">
              <div className="text-center mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <svg className="w-12 h-12 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800 font-semibold">Xác nhận OTP thành công!</p>
              </div>

              <p className="text-gray-600 text-center mb-4">
                Nhấn nút bên dưới để hoàn tất đổi mật khẩu
              </p>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:scale-95 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  'Hoàn Tất Đổi Mật Khẩu'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('otp');
                  setErrors({});
                }}
                className="w-full py-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← Quay lại
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">hoặc</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Back Link */}
          <p className="text-center text-gray-600">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
              ← Quay lại trang chủ
            </Link>
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
