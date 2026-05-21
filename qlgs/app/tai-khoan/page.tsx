"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, Section } from "@/component/ui";
import { useAuthStore } from "@/store/auth.store";
import axiosClient from '@/services/axiosClient';

interface TaiKhoanInfo {
  idTaiKhoan: string;
  email: string;
  tenDangNhap: string;
  anhDaiDien: string | null;
  ngayTao: string;
  nganHang: string | null;
  stk: string | null;
  loaiNguoiDungID: string;
}

export default function TaiKhoanPage() {
  const { tenDangNhap, loaiNguoiDungID } = useAuthStore();
  const [account, setAccount] = useState<TaiKhoanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- STATES CHO FORM EMAIL ---
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isWaitingOtp, setIsWaitingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' });

  // --- STATES CHO FORM NGÂN HÀNG ---
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankData, setBankData] = useState({ nganHang: '', stk: '' });
  const [bankMsg, setBankMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  const fetchAccountInfo = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Phiên đăng nhập đã hết hạn.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data: any = await axiosClient.get('/tai-khoan/thong-tin-hien-tai');
      setAccount(data);
      setBankData({ nganHang: data.nganHang || '', stk: data.stk || '' });
    } catch (err) {
      setError('Không thể tải thông tin tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC XỬ LÝ EMAIL & OTP ---
  const handleRequestChangeEmail = async () => {
    if (!newEmail || newEmail === account?.email) return;
    try {
      setEmailMsg({ type: 'info', text: 'Đang gửi mã OTP...' });
      // GỌI API GỬI OTP (Khang chỉnh lại endpoint cho đúng)
      await axiosClient.post('/tai-khoan/yeu-cau-doi-email', { email: newEmail });
      setIsWaitingOtp(true);
      setEmailMsg({ type: 'success', text: 'Mã OTP đã được gửi đến email mới!' });
    } catch (err: any) {
      setEmailMsg({ type: 'error', text: err.response?.data?.message || 'Email đã tồn tại hoặc lỗi hệ thống!' });
    }
  };

  const handleVerifyOtpAndSaveEmail = async () => {
    if (!otpCode) return;
    try {
      // GỌI API XÁC NHẬN OTP
      await axiosClient.post('/tai-khoan/xac-nhan-doi-email', { email: newEmail, otp: otpCode });
      setAccount(prev => prev ? { ...prev, email: newEmail } : null);
      setIsEditingEmail(false);
      setIsWaitingOtp(false);
      setOtpCode('');
      setNewEmail('');
      setEmailMsg({ type: 'success', text: 'Cập nhật email thành công!' });
      setTimeout(() => setEmailMsg({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setEmailMsg({ type: 'error', text: 'Mã OTP không chính xác!' });
    }
  };

  // --- LOGIC XỬ LÝ NGÂN HÀNG ---
  const handleSaveBankInfo = async () => {
    try {
      setBankMsg({ type: 'info', text: 'Đang lưu...' });
      // GỌI API LƯU NGÂN HÀNG
      await axiosClient.put('/tai-khoan/cap-nhat-ngan-hang', bankData);
      setAccount(prev => prev ? { ...prev, nganHang: bankData.nganHang, stk: bankData.stk } : null);
      setIsEditingBank(false);
      setBankMsg({ type: 'success', text: 'Cập nhật tài khoản ngân hàng thành công!' });
      setTimeout(() => setBankMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setBankMsg({ type: 'error', text: 'Lỗi khi cập nhật thông tin ngân hàng.' });
    }
  };

  const getRoleName = (id?: string) => {
    switch (id) {
      case '1': return 'Phụ Huynh / Học Viên';
      case '2': return 'Đối tác Gia Sư';
      case '3': return 'Nhân viên hệ thống';
      case '4': return 'Quản trị viên (Admin)';
      default: return 'Người dùng hệ thống';
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  if (error || !account) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><p>{error}</p><Link href="/login"><Button>Đăng nhập lại</Button></Link></div>;

  return (
    <main className="min-h-screen bg-[#f8fafc] py-12">
      <Section>
        <div className="max-w-5xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cài đặt tài khoản</h1>
            <p className="text-slate-500 mt-2">Quản lý thông tin định danh và phương thức thanh toán của bạn.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* CỘT TRÁI: THẺ ĐỊNH DANH (Giữ nguyên) */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 text-center">
                <div className="relative inline-block mb-6">
                  {account.anhDaiDien ? (
                    <img src={account.anhDaiDien} className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 shadow-md mx-auto" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg mx-auto">
                      {account.tenDangNhap?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors">📷</button>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">{account.tenDangNhap}</h2>
                <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-6">{getRoleName(account.loaiNguoiDungID)}</p>
                <div className="border-t border-slate-100 pt-6 mt-2 space-y-3 text-left">
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400 mb-1">Mã tài khoản</p>
                    <p className="text-sm font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{account.idTaiKhoan}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400 mb-1">Ngày tham gia</p>
                    <p className="text-sm font-medium text-slate-700">{account.ngayTao ? new Date(account.ngayTao).toLocaleDateString('vi-VN') : '---'}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* CỘT PHẢI */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* KHỐI 1: BẢO MẬT & EMAIL */}
              <Card className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">📧</span>
                    Bảo mật & Đăng nhập
                  </h3>
                </div>

                {emailMsg.text && (
                  <div className={`p-3 rounded-xl text-sm font-medium mb-4 ${emailMsg.type === 'error' ? 'bg-red-50 text-red-600' : emailMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    {emailMsg.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tên đăng nhập (Cố định)</label>
                    <input type="text" disabled value={account.tenDangNhap} className="w-full bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-xl px-4 py-3 cursor-not-allowed font-medium" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Địa chỉ Email</label>
                      {!isEditingEmail && !isWaitingOtp && (
                        <button onClick={() => { setIsEditingEmail(true); setNewEmail(account.email || ''); }} className="text-xs font-bold text-blue-600 hover:text-blue-700">Sửa Email</button>
                      )}
                    </div>
                    
                    {!isEditingEmail ? (
                      <div className="relative">
                        <input type="email" disabled value={account.email || 'Chưa có email'} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 font-medium" />
                      </div>
                    ) : (
                      <div className="space-y-3 animate-in fade-in zoom-in duration-200">
                        <input 
                          type="email" 
                          disabled={isWaitingOtp}
                          value={newEmail} 
                          onChange={(e) => setNewEmail(e.target.value)} 
                          placeholder="Nhập email mới..."
                          className="w-full bg-white border border-blue-300 focus:ring-2 focus:ring-blue-100 text-slate-700 text-sm rounded-xl px-4 py-3 font-medium outline-none transition-all" 
                        />
                        
                        {isWaitingOtp && (
                          <input 
                            type="text" 
                            value={otpCode} 
                            onChange={(e) => setOtpCode(e.target.value)} 
                            placeholder="Nhập mã OTP 6 số"
                            className="w-full bg-amber-50 border border-amber-300 focus:ring-2 focus:ring-amber-100 text-amber-900 text-sm rounded-xl px-4 py-3 font-medium outline-none tracking-widest text-center" 
                          />
                        )}

                        <div className="flex gap-2">
                          {!isWaitingOtp ? (
                            <Button onClick={handleRequestChangeEmail} className="flex-1 bg-blue-600 text-white rounded-xl shadow-md">Gửi mã xác nhận</Button>
                          ) : (
                            <Button onClick={handleVerifyOtpAndSaveEmail} className="flex-1 bg-emerald-600 text-white rounded-xl shadow-md">Xác nhận OTP</Button>
                          )}
                          <Button 
                            variant="secondary" 
                            className="rounded-xl border-slate-200"
                            onClick={() => { setIsEditingEmail(false); setIsWaitingOtp(false); setOtpCode(''); setEmailMsg({type:'', text:''}); }}
                          >Hủy</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* KHỐI 2: THÔNG TIN NGÂN HÀNG */}
              <Card className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">💳</span>
                    Tài khoản nhận thanh toán
                  </h3>
                  {!isEditingBank && (
                    <Button onClick={() => setIsEditingBank(true)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm px-4 py-2 h-auto rounded-xl shadow-none">
                      {account.nganHang ? 'Thay đổi' : 'Thêm tài khoản'}
                    </Button>
                  )}
                </div>

                {bankMsg.text && (
                  <div className={`p-3 rounded-xl text-sm font-medium mb-4 ${bankMsg.type === 'error' ? 'bg-red-50 text-red-600' : bankMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    {bankMsg.text}
                  </div>
                )}

                {!isEditingBank ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none"></div>
                    {account.nganHang && account.stk ? (
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center text-2xl">🏦</div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ngân hàng</p>
                          <p className="text-lg font-black text-slate-800 mb-2 leading-none">{account.nganHang}</p>
                          <p className="text-sm font-mono font-bold text-slate-600 tracking-widest bg-white px-3 py-1 rounded-md border border-slate-200 inline-block">
                            {account.stk}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-slate-500 text-sm">Chưa thiết lập thông tin ngân hàng.</div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 animate-in fade-in zoom-in duration-200 space-y-4">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tên ngân hàng (VD: Vietcombank, MBBank)</label>
                      <input 
                        type="text" 
                        value={bankData.nganHang} 
                        onChange={(e) => setBankData({...bankData, nganHang: e.target.value})}
                        className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Số tài khoản</label>
                      <input 
                        type="text" 
                        value={bankData.stk} 
                        onChange={(e) => setBankData({...bankData, stk: e.target.value})}
                        className="w-full bg-white border border-slate-300 font-mono text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button onClick={handleSaveBankInfo} className="bg-blue-600 text-white rounded-xl shadow-md">Lưu thông tin</Button>
                      <Button variant="secondary" onClick={() => { setIsEditingBank(false); setBankData({nganHang: account.nganHang||'', stk: account.stk||''}); }} className="rounded-xl border-slate-200">Hủy bỏ</Button>
                    </div>
                  </div>
                )}
              </Card>

            </div>
          </div>
          
        </div>
      </Section>
    </main>
  );
}