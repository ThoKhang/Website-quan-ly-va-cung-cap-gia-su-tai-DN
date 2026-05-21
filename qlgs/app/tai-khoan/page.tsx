"use client";

import React, { useState, useEffect, useRef } from 'react';
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

        // Dùng any tạm thời để bỏ qua lỗi TypeScript
        const response: any = await axiosClient.post('/tai-khoan/cap-nhat-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        console.log("✅ Response data:", response);

        // Xử lý linh hoạt
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
  // --- LOGIC: ĐỔI MẬT KHẨU ---
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

  // --- LOGIC: EMAIL & NGÂN HÀNG (Giữ nguyên của bạn) ---
  const handleRequestChangeEmail = async () => { /* ... (Code cũ của bạn) ... */
    if (!newEmail || newEmail === account?.email) return;
    try {
      setEmailMsg({ type: 'info', text: 'Đang gửi mã OTP...' });
      await axiosClient.post('/tai-khoan/yeu-cau-doi-email', { email: newEmail });
      setIsWaitingOtp(true);
      setEmailMsg({ type: 'success', text: 'Mã OTP đã được gửi đến email mới!' });
    } catch (err: any) { setEmailMsg({ type: 'error', text: err.response?.data?.message || 'Lỗi!' }); }
  };

  const handleVerifyOtpAndSaveEmail = async () => { /* ... (Code cũ của bạn) ... */
    if (!otpCode) return;
    try {
      await axiosClient.post('/tai-khoan/xac-nhan-doi-email', { email: newEmail, otp: otpCode });
      setAccount(prev => prev ? { ...prev, email: newEmail } : null);
      setIsEditingEmail(false); setIsWaitingOtp(false); setOtpCode(''); setNewEmail('');
      setEmailMsg({ type: 'success', text: 'Cập nhật email thành công!' });
      setTimeout(() => setEmailMsg({ type: '', text: '' }), 3000);
    } catch (err: any) { setEmailMsg({ type: 'error', text: 'Mã OTP không chính xác!' }); }
  };

  const handleSaveBankInfo = async () => { /* ... (Code cũ của bạn) ... */
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

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  if (error || !account) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><p>{error}</p><Link href="/login"><Button>Đăng nhập lại</Button></Link></div>;

  return (
    <main className="min-h-screen bg-[#f8fafc] py-12">
      <Section>
        <div className="max-w-5xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cài đặt tài khoản</h1>
            <p className="text-slate-500 mt-2">Quản lý thông tin định danh và phương thức bảo mật.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* CỘT TRÁI: THẺ ĐỊNH DANH */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 text-center">
                
                {/* Khu vực Avatar có tính năng tải ảnh */}
                <div className="relative inline-block mb-6">
                  {account.anhDaiDien ? (
                    <img src={account.anhDaiDien} className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 shadow-md mx-auto" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg mx-auto">
                      {account.tenDangNhap?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  {/* Input ẩn để chọn file */}
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    📷
                  </button>
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
              
              {/* KHỐI 1: BẢO MẬT & ĐĂNG NHẬP */}
              <Card className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">🛡️</span>
                    Bảo mật & Đăng nhập
                  </h3>
                  {!isChangingPass && (
                    <Button onClick={() => setIsChangingPass(true)} variant="secondary" className="text-sm px-4 py-2 h-auto rounded-xl">Đổi mật khẩu</Button>
                  )}
                </div>

                {passMsg.text && (
                  <div className={`p-3 rounded-xl text-sm font-medium mb-4 ${passMsg.type === 'error' ? 'bg-red-50 text-red-600' : passMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    {passMsg.text}
                  </div>
                )}

                {/* --- FORM ĐỔI MẬT KHẨU (Trượt xuống khi bấm) --- */}
                {isChangingPass && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 animate-in fade-in zoom-in duration-200 space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 mb-2">Thay đổi mật khẩu</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Mật khẩu cũ</label>
                        <input type="password" disabled={isWaitingPassOtp} value={passData.matKhauCu} onChange={(e) => setPassData({...passData, matKhauCu: e.target.value})} className="w-full bg-white border border-slate-300 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500" />
                      </div>
                      <div className="hidden md:block"></div> {/* Spacer */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Mật khẩu mới</label>
                        <input type="password" disabled={isWaitingPassOtp} value={passData.matKhauMoi} onChange={(e) => setPassData({...passData, matKhauMoi: e.target.value})} className="w-full bg-white border border-slate-300 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Xác nhận mật khẩu</label>
                        <input type="password" disabled={isWaitingPassOtp} value={passData.xacNhanMatKhau} onChange={(e) => setPassData({...passData, xacNhanMatKhau: e.target.value})} className="w-full bg-white border border-slate-300 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-blue-500" />
                      </div>
                    </div>

                    {isWaitingPassOtp && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <label className="block text-xs font-bold text-amber-600 mb-1">Nhập mã OTP gửi về Email</label>
                        <input type="text" value={passData.otp} onChange={(e) => setPassData({...passData, otp: e.target.value})} placeholder="Nhập mã 6 số" className="w-full md:w-1/2 bg-amber-50 border border-amber-300 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-200 tracking-widest text-center font-bold" />
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {!isWaitingPassOtp ? (
                        <Button onClick={handleRequestPassOtp} className="bg-blue-600 text-white rounded-xl">Gửi mã OTP</Button>
                      ) : (
                        <Button onClick={handleSubmitChangePass} className="bg-emerald-600 text-white rounded-xl">Xác nhận đổi MK</Button>
                      )}
                      <Button variant="secondary" onClick={() => { setIsChangingPass(false); setIsWaitingPassOtp(false); setPassData({matKhauCu:'', matKhauMoi:'', xacNhanMatKhau:'', otp:''}); setPassMsg({type:'', text:''}); }} className="rounded-xl border-slate-200">Hủy</Button>
                    </div>
                  </div>
                )}

                {emailMsg.text && !isChangingPass && (
                  <div className={`p-3 rounded-xl text-sm font-medium mb-4 ${emailMsg.type === 'error' ? 'bg-red-50 text-red-600' : emailMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    {emailMsg.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
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
                        <input type="email" disabled={isWaitingOtp} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Nhập email mới..." className="w-full bg-white border border-blue-300 focus:ring-2 focus:ring-blue-100 text-slate-700 text-sm rounded-xl px-4 py-3 font-medium outline-none" />
                        
                        {isWaitingOtp && (
                          <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="Nhập mã OTP" className="w-full bg-amber-50 border border-amber-300 text-sm rounded-xl px-4 py-3 font-medium outline-none text-center" />
                        )}

                        <div className="flex gap-2">
                          {!isWaitingOtp ? (
                            <Button onClick={handleRequestChangeEmail} className="flex-1 bg-blue-600 text-white rounded-xl">Gửi mã xác nhận</Button>
                          ) : (
                            <Button onClick={handleVerifyOtpAndSaveEmail} className="flex-1 bg-emerald-600 text-white rounded-xl">Xác nhận OTP</Button>
                          )}
                          <Button variant="secondary" onClick={() => { setIsEditingEmail(false); setIsWaitingOtp(false); }} className="rounded-xl">Hủy</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* KHỐI 2: THÔNG TIN NGÂN HÀNG (Giữ nguyên) */}
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
                  <div className={`p-3 rounded-xl text-sm font-medium mb-4 ${bankMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {bankMsg.text}
                  </div>
                )}

                {!isEditingBank ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 relative overflow-hidden">
                    {account.nganHang && account.stk ? (
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center text-2xl">🏦</div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Ngân hàng</p>
                          <p className="text-lg font-black text-slate-800 mb-2">{account.nganHang}</p>
                          <p className="text-sm font-mono font-bold text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200 inline-block">{account.stk}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-slate-500 text-sm">Chưa thiết lập thông tin ngân hàng.</div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-500 mb-2">Tên ngân hàng</label>
                      <input type="text" value={bankData.nganHang} onChange={(e) => setBankData({...bankData, nganHang: e.target.value})} className="w-full bg-white border border-slate-300 text-sm rounded-xl px-4 py-3 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-500 mb-2">Số tài khoản</label>
                      <input type="text" value={bankData.stk} onChange={(e) => setBankData({...bankData, stk: e.target.value})} className="w-full bg-white border border-slate-300 font-mono text-sm rounded-xl px-4 py-3 outline-none" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button onClick={handleSaveBankInfo} className="bg-blue-600 text-white rounded-xl">Lưu thông tin</Button>
                      <Button variant="secondary" onClick={() => setIsEditingBank(false)} className="rounded-xl">Hủy bỏ</Button>
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