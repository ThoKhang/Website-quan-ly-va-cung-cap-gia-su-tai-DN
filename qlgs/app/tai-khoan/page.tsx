"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from "@/store/auth.store";
import axiosClient from '@/services/axiosClient';
// Cập nhật import icons từ lucide-react để giao diện chuyên nghiệp hơn
import { 
  Home, ChevronRight, ArrowLeft, Camera, ShieldCheck, 
  CreditCard, Mail, KeyRound, User, Loader2 
} from "lucide-react";

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
  const router = useRouter();
  const { tenDangNhap, loaiNguoiDungID } = useAuthStore();
  
  const [account, setAccount] = useState<TaiKhoanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // STATES: Email
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isWaitingOtp, setIsWaitingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' });

  // STATES: Ngân hàng
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankData, setBankData] = useState({ nganHang: '', stk: '' });
  const [bankMsg, setBankMsg] = useState({ type: '', text: '' });

  // STATES: Mật khẩu
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passData, setPassData] = useState({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '', otp: '' });
  const [isWaitingPassOtp, setIsWaitingPassOtp] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  // REF: Avatar input
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ảnh không được lớn hơn 5MB!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log("🚀 Đang upload avatar...");
      const response: any = await axiosClient.post('/tai-khoan/cap-nhat-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log("✅ Response data:", response);

      let imageUrl: string | null = null;
      if (response?.anhDaiDien) {
        imageUrl = response.anhDaiDien;
      } else if (response?.data?.anhDaiDien) {
        imageUrl = response.data.anhDaiDien;
      } else if (response?.message && typeof response.message === 'object') {
        imageUrl = response.message.anhDaiDien;
      }

      if (imageUrl) {
        setAccount(prev => prev ? { 
          ...prev, 
          anhDaiDien: imageUrl + "?t=" + Date.now() 
        } : null);
        alert('✅ Cập nhật avatar thành công!');
      } else {
        console.warn("⚠️ Không lấy được anhDaiDien, đang load lại thông tin...");
        await fetchAccountInfo();
        alert('Cập nhật thành công! Ảnh sẽ hiển thị sau khi tải lại trang.');
      }
    } catch (err: any) {
      console.error("❌ Lỗi upload avatar:", err);
      alert(err?.message || 'Lỗi khi cập nhật avatar. Vui lòng thử lại.');
    }
  };

  const handleRequestPassOtp = async () => {
    if (!passData.matKhauCu || !passData.matKhauMoi || passData.matKhauMoi !== passData.xacNhanMatKhau) {
      setPassMsg({ type: 'error', text: 'Vui lòng điền đủ thông tin và đảm bảo mật khẩu khớp nhau!' });
      return;
    }
    try {
      setPassMsg({ type: 'info', text: 'Đang gửi mã OTP...' });
      await axiosClient.post('/tai-khoan/send-change-password-otp');
      setIsWaitingPassOtp(true);
      setPassMsg({ type: 'success', text: 'Mã OTP đã được gửi đến email của bạn!' });
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Lỗi gửi OTP!' });
    }
  };

  const handleSubmitChangePass = async () => {
    if (!passData.otp) {
      setPassMsg({ type: 'error', text: 'Vui lòng nhập mã OTP!' });
      return;
    }
    try {
      setPassMsg({ type: 'info', text: 'Đang xử lý...' });
      await axiosClient.post('/tai-khoan/doi-mat-khau', passData);
      setIsChangingPass(false);
      setIsWaitingPassOtp(false);
      setPassData({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '', otp: '' });
      setPassMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setTimeout(() => setPassMsg({ type: '', text: '' }), 3000);
      alert('Đổi mật khẩu thành công! Bạn có thể tiếp tục sử dụng hệ thống.');
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Sai OTP hoặc mật khẩu cũ không đúng!' });
    }
  };

  const handleRequestChangeEmail = async () => {
    if (!newEmail || newEmail === account?.email) return;
    try {
      setEmailMsg({ type: 'info', text: 'Đang gửi mã OTP...' });
      await axiosClient.post('/tai-khoan/yeu-cau-doi-email', { email: newEmail });
      setIsWaitingOtp(true);
      setEmailMsg({ type: 'success', text: 'Mã OTP đã được gửi đến email mới!' });
    } catch (err: any) { setEmailMsg({ type: 'error', text: err.response?.data?.message || 'Lỗi!' }); }
  };

  const handleVerifyOtpAndSaveEmail = async () => {
    if (!otpCode) return;
    try {
      await axiosClient.post('/tai-khoan/xac-nhan-doi-email', { email: newEmail, otp: otpCode });
      setAccount(prev => prev ? { ...prev, email: newEmail } : null);
      setIsEditingEmail(false); setIsWaitingOtp(false); setOtpCode(''); setNewEmail('');
      setEmailMsg({ type: 'success', text: 'Cập nhật email thành công!' });
      setTimeout(() => setEmailMsg({ type: '', text: '' }), 3000);
    } catch (err: any) { setEmailMsg({ type: 'error', text: 'Mã OTP không chính xác!' }); }
  };

  const handleSaveBankInfo = async () => {
    try {
      setBankMsg({ type: 'info', text: 'Đang lưu...' });
      await axiosClient.put('/tai-khoan/cap-nhat-ngan-hang', bankData);
      setAccount(prev => prev ? { ...prev, nganHang: bankData.nganHang, stk: bankData.stk } : null);
      setIsEditingBank(false);
      setBankMsg({ type: 'success', text: 'Cập nhật thành công!' });
      setTimeout(() => setBankMsg({ type: '', text: '' }), 3000);
    } catch (err) { setBankMsg({ type: 'error', text: 'Lỗi cập nhật!' }); }
  };

  const getRoleName = (id?: string) => {
    switch (id) {
      case '1': return 'Phụ Huynh / Học Viên'; case '2': return 'Đối tác Gia Sư';
      case '3': return 'Nhân viên hệ thống'; case '4': return 'Quản trị viên';
      default: return 'Người dùng hệ thống';
    }
  };

  // --- TRẠNG THÁI LOADING & ERROR ---
  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center gap-3">
      <Loader2 size={40} className="animate-spin text-blue-600" />
      <p className="text-slate-500 font-medium">Đang tải thông tin...</p>
    </div>
  );
  
  if (error || !account) return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-6">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl text-center max-w-sm w-full">
        <ShieldCheck size={48} className="text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-800 mb-2">Đã có lỗi xảy ra</h3>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <Link href="/login">
          <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all">
            Đăng nhập lại
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      
      {/* ══════════════════════════════════
          HERO BANNER & BREADCRUMBS
      ══════════════════════════════════ */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 w-full pt-5 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          
          {/* Điều hướng */}
          <div className="flex items-center justify-between mb-8">
            <nav className="flex items-center text-sm font-medium text-blue-200/70">
              <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5"><Home size={14} /> Trang chủ</Link>
              <ChevronRight size={14} className="mx-2 flex-shrink-0" />
              <span className="text-white font-bold">Quản lý tài khoản</span>
            </nav>
            <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-blue-200 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <ArrowLeft size={16} /> Quay lại
            </button>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">Hồ sơ cá nhân</h1>
          <p className="text-blue-200 text-sm font-medium max-w-xl">Quản lý thông tin định danh, phương thức bảo mật và tài khoản thanh toán của bạn.</p>
        </div>
      </div>

      {/* ══════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-20 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
            
          {/* CỘT TRÁI: THẺ ĐỊNH DANH (SIDEBAR) */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 p-8 text-center lg:sticky lg:top-6">
            
            {/* Avatar Section */}
            <div className="relative inline-block mb-6 group">
              {account.anhDaiDien ? (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto relative">
                   <img src={account.anhDaiDien} alt="Avatar" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black border-4 border-white shadow-lg mx-auto">
                  {account.tenDangNhap?.charAt(0).toUpperCase() || <User size={40}/>}
                </div>
              )}
              
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-10 h-10 bg-white rounded-full border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all z-10"
                title="Thay đổi ảnh đại diện"
              >
                <Camera size={18} />
              </button>
            </div>

            <h2 className="text-xl font-black text-slate-900 mb-1">{account.tenDangNhap}</h2>
            <p className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg inline-block mb-6 uppercase tracking-wide">
              {getRoleName(account.loaiNguoiDungID)}
            </p>
            
            <div className="border-t border-slate-100 pt-6 space-y-4 text-left">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Mã tài khoản</p>
                <p className="text-sm font-mono font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  {account.idTaiKhoan}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Ngày tham gia</p>
                <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {account.ngayTao ? new Date(account.ngayTao).toLocaleDateString('vi-VN') : '---'}
                </p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT */}
          <div className="space-y-8">
              
            {/* KHỐI 1: BẢO MẬT & ĐĂNG NHẬP */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  Bảo mật & Đăng nhập
                </h3>
                {!isChangingPass && (
                  <button 
                    onClick={() => setIsChangingPass(true)} 
                    className="text-sm font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <KeyRound size={16}/> Đổi mật khẩu
                  </button>
                )}
              </div>

              {passMsg.text && (
                <div className={`p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 border ${passMsg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : passMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {passMsg.text}
                </div>
              )}

              {/* --- FORM ĐỔI MẬT KHẨU --- */}
              {isChangingPass && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
                  <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">Thay đổi mật khẩu</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mật khẩu cũ</label>
                      <input type="password" disabled={isWaitingPassOtp} value={passData.matKhauCu} onChange={(e) => setPassData({...passData, matKhauCu: e.target.value})} className="w-full md:w-1/2 bg-white border border-slate-200 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mật khẩu mới</label>
                      <input type="password" disabled={isWaitingPassOtp} value={passData.matKhauMoi} onChange={(e) => setPassData({...passData, matKhauMoi: e.target.value})} className="w-full bg-white border border-slate-200 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Xác nhận mật khẩu mới</label>
                      <input type="password" disabled={isWaitingPassOtp} value={passData.xacNhanMatKhau} onChange={(e) => setPassData({...passData, xacNhanMatKhau: e.target.value})} className="w-full bg-white border border-slate-200 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" />
                    </div>
                  </div>

                  {isWaitingPassOtp && (
                    <div className="mt-5 pt-5 border-t border-slate-200">
                      <label className="block text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Nhập mã OTP (Gửi về Email)</label>
                      <input type="text" value={passData.otp} onChange={(e) => setPassData({...passData, otp: e.target.value})} placeholder="Nhập mã 6 số..." className="w-full md:w-1/2 bg-amber-50 border border-amber-300 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400 tracking-widest text-center font-bold text-amber-900 placeholder:font-normal" />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-6">
                    {!isWaitingPassOtp ? (
                      <button onClick={handleRequestPassOtp} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all">
                        Gửi mã xác nhận
                      </button>
                    ) : (
                      <button onClick={handleSubmitChangePass} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all">
                        Xác nhận đổi MK
                      </button>
                    )}
                    <button onClick={() => { setIsChangingPass(false); setIsWaitingPassOtp(false); setPassData({matKhauCu:'', matKhauMoi:'', xacNhanMatKhau:'', otp:''}); setPassMsg({type:'', text:''}); }} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm rounded-xl transition-all">
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              )}

              {/* Thông báo Email */}
              {emailMsg.text && !isChangingPass && (
                <div className={`p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 border ${emailMsg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : emailMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {emailMsg.text}
                </div>
              )}

              {/* Thông tin cố định & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tên đăng nhập (Cố định)</label>
                  <input type="text" disabled value={account.tenDangNhap} className="w-full bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-xl px-4 py-3 cursor-not-allowed font-medium" />
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Địa chỉ Email</label>
                    {!isEditingEmail && !isWaitingOtp && (
                      <button onClick={() => { setIsEditingEmail(true); setNewEmail(account.email || ''); }} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-2 py-1 rounded-md">
                        Đổi Email
                      </button>
                    )}
                  </div>
                  
                  {!isEditingEmail ? (
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="email" disabled value={account.email || 'Chưa cập nhật email'} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl pl-11 pr-4 py-3 font-medium" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                        <input type="email" disabled={isWaitingOtp} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Nhập email mới..." className="w-full bg-white border border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 font-bold outline-none shadow-sm shadow-blue-500/10" />
                      </div>
                      
                      {isWaitingOtp && (
                        <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="Nhập mã OTP gửi về Email" className="w-full bg-amber-50 border border-amber-300 text-sm rounded-xl px-4 py-3 font-bold outline-none text-center tracking-widest" />
                      )}

                      <div className="flex gap-2">
                        {!isWaitingOtp ? (
                          <button onClick={handleRequestChangeEmail} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md">
                            Gửi OTP
                          </button>
                        ) : (
                          <button onClick={handleVerifyOtpAndSaveEmail} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md">
                            Xác nhận OTP
                          </button>
                        )}
                        <button onClick={() => { setIsEditingEmail(false); setIsWaitingOtp(false); }} className="py-2.5 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all">
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* KHỐI 2: THÔNG TIN NGÂN HÀNG */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  Tài khoản thanh toán
                </h3>
                {!isEditingBank && (
                  <button 
                    onClick={() => setIsEditingBank(true)} 
                    className="text-sm font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl border border-emerald-200 transition-colors"
                  >
                    {account.nganHang ? 'Thay đổi thông tin' : 'Thêm tài khoản'}
                  </button>
                )}
              </div>

              {bankMsg.text && (
                <div className={`p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-3 border ${bankMsg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {bankMsg.text}
                </div>
              )}

              {!isEditingBank ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  {account.nganHang && account.stk ? (
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
                        <CreditCard size={28} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ngân hàng thụ hưởng</p>
                        <p className="text-lg font-black text-slate-800 mb-1">{account.nganHang}</p>
                        <p className="text-sm font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100 inline-block">
                          STK: {account.stk}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CreditCard size={40} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium text-sm">Chưa thiết lập thông tin ngân hàng nhận tiền.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tên ngân hàng</label>
                      <input type="text" value={bankData.nganHang} onChange={(e) => setBankData({...bankData, nganHang: e.target.value})} placeholder="VD: Vietcombank, MB Bank..." className="w-full bg-white border border-slate-300 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Số tài khoản</label>
                      <input type="text" value={bankData.stk} onChange={(e) => setBankData({...bankData, stk: e.target.value})} placeholder="Nhập số tài khoản..." className="w-full bg-white border border-slate-300 font-mono text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSaveBankInfo} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all">
                      Lưu thông tin
                    </button>
                    <button onClick={() => setIsEditingBank(false)} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm rounded-xl transition-all">
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}