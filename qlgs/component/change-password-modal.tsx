"use client";

import React, { useState } from 'react';
import { authService } from '@/services/auth.service';

type Step = 'password' | 'otp';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
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
  const [maskedEmail, setMaskedEmail] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (step === 'password') {
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
    } else if (step === 'otp') {
      if (!validateOtpForm()) {
        return;
      }

      setLoading(true);

      try {
        await authService.changePassword({
          matKhauCu: formData.matKhauCu,
          matKhauMoi: formData.matKhauMoi,
          xacNhanMatKhau: formData.xacNhanMatKhau,
          otp: formData.otp,
        });

        setMessage('');
        setFormData({
          matKhauCu: '',
          matKhauMoi: '',
          xacNhanMatKhau: '',
          otp: '',
        });
        setStep('password');

        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
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
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; width: string } => {
    if (!password) return { strength: '', color: '', width: '0%' };
    if (password.length < 6) return { strength: 'Yếu', color: 'bg-red-500', width: '33%' };
    if (password.length < 10) return { strength: 'Trung bình', color: 'bg-yellow-500', width: '66%' };
    return { strength: 'Mạnh', color: 'bg-green-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(formData.matKhauMoi);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Đổi Mật Khẩu</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {message && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Password */}
            {step === 'password' && (
              <>
                {/* Mật khẩu cũ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu cũ
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.old ? 'text' : 'password'}
                      name="matKhauCu"
                      value={formData.matKhauCu}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.matKhauCu ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Nhập mật khẩu cũ"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
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
                    <p className="mt-1 text-xs text-red-600">{errors.matKhauCu}</p>
                  )}
                </div>

                {/* Mật khẩu mới */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="matKhauMoi"
                      value={formData.matKhauMoi}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.matKhauMoi ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Nhập mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
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
                  {errors.matKhauMoi && (
                    <p className="mt-1 text-xs text-red-600">{errors.matKhauMoi}</p>
                  )}
                </div>

                {/* Xác nhận mật khẩu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="xacNhanMatKhau"
                      value={formData.xacNhanMatKhau}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        errors.xacNhanMatKhau ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
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
                    <p className="mt-1 text-xs text-red-600">{errors.xacNhanMatKhau}</p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: OTP */}
            {step === 'otp' && (
              <>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-1">Mã OTP đã được gửi đến:</p>
                  <p className="font-semibold text-orange-600">{maskedEmail}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className={`w-full px-3 py-2 border rounded-lg text-center text-2xl tracking-[0.3em] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.otp ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="------"
                  />
                  {errors.otp && (
                    <p className="mt-1 text-xs text-red-600">{errors.otp}</p>
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={() => {
              if (step === 'otp') {
                setStep('password');
                setFormData(prev => ({ ...prev, otp: '' }));
                setErrors({});
              } else {
                onClose();
              }
            }}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
          >
            {step === 'otp' ? 'Quay lại' : 'Hủy'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (step === 'otp' && formData.otp.length !== 6)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition flex items-center gap-2 ${
              loading || (step === 'otp' && formData.otp.length !== 6)
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang xử lý...
              </>
            ) : step === 'password' ? (
              'Tiếp Tục'
            ) : (
              'Xác Nhận OTP'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
