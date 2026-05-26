"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Section } from "@/component/ui";
import { BangCap } from "@/types/auth.type";
import axiosClient from '@/services/axiosClient';

export default function EditGiaSuHoSo() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  const [formData, setFormData] = useState({ 
    tenGiaSu: '', 
    sdt: '', 
    cccd: '',
    heSoLuong: 0.75,
    luongHienCon: 0
  });
  
  const [bangCapList, setBangCapList] = useState<BangCap[]>([]);
  const [showBangCapForm, setShowBangCapForm] = useState(false);
  const [bangCapForm, setBangCapForm] = useState({ tenBangCap: '', thongTinBangCap: '', ngayCap: '', anhMinhChung: '' });
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false); // Thêm state quản lý lúc upload ảnh bằng cấp
  
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    setIsMounted(true);
    const fetchGiaSuInfo = async () => {
      try {
        const data: any = await axiosClient.get('/gia-su/thong-tin-hien-tai');
        setFormData({
          tenGiaSu: data.tenGiaSu || '',
          sdt: data.sdt || '',
          cccd: data.cccd || '',
          heSoLuong: data.heSoLuong || 0.75, 
          luongHienCon: data.luongHienCon || 0, 
        });
        
        const rawBangCapList = data.bangCapList || data.danhSachBangCap || data.bangCaps || [];
        setBangCapList(Array.isArray(rawBangCapList) ? rawBangCapList : []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchGiaSuInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBangCapChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBangCapForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // =========================================
  // HÀM UPLOAD ẢNH MINH CHỨNG
  // =========================================
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setMessage('');
      
      const fileData = new FormData();
      fileData.append('file', file);
      
      // Gọi API Upload đã có sẵn của hệ thống
      const res: any = await axiosClient.post('/public/upload', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Lưu URL do Backend trả về vào form Bằng cấp
      setBangCapForm(prev => ({ ...prev, anhMinhChung: res.fileUrl }));
      
    } catch (err: any) {
      setMessage('Không thể tải ảnh lên. Vui lòng kiểm tra lại dung lượng hoặc định dạng file.');
      setMessageType('error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddBangCap = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bangCapForm.anhMinhChung) {
      setMessage('Vui lòng tải lên ảnh minh chứng.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/gia-su/them-bang-cap', bangCapForm);
      
      // ✅ Fetch lại từ server thay vì tự thêm vào state
      const data: any = await axiosClient.get('/gia-su/thong-tin-hien-tai');
      const rawBangCapList = data.bangCapList || data.danhSachBangCap || data.bangCaps || [];
      setBangCapList(Array.isArray(rawBangCapList) ? rawBangCapList : []);
      
      setBangCapForm({ tenBangCap: '', thongTinBangCap: '', ngayCap: '', anhMinhChung: '' });
      setShowBangCapForm(false);
      setMessage('Thêm bằng cấp thành công!');
      setMessageType('success');
    } catch (error) {
      setMessage('Thêm bằng cấp thất bại.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBangCap = async (index: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bằng cấp này?')) return;
    try {
      const bangCap = bangCapList[index];
      if (bangCap.idBangCap) {
        await axiosClient.delete(`/gia-su/bang-cap/${bangCap.idBangCap}`);
      }
      setBangCapList(bangCapList.filter((_, i) => i !== index));
    } catch (error) {
      setMessage('Xóa bằng cấp thất bại.');
      setMessageType('error');
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!/^\d{10,11}$/.test(formData.sdt.trim()) || !/^\d{12}$/.test(formData.cccd.trim())) {
      setMessage('Số điện thoại hoặc CCCD không hợp lệ.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const idGiaSu = localStorage.getItem('idGiaSu');
      const submitData = {
        tenGiaSu: formData.tenGiaSu,
        sdt: formData.sdt,
        cccd: formData.cccd
      };
      await axiosClient.put(`/gia-su/${idGiaSu}`, submitData);
      
      router.push('/gia-su/ho-so');
    } catch (error) {
      setMessage('Lỗi khi lưu hồ sơ.');
      setMessageType('error');
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="page-shell bg-slate-50 min-h-screen pb-12">
      <Section>
        <div className="max-w-4xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          
          <div className="flex items-center gap-4 mb-6">
            <Link href="/gia-su/ho-so">
              <Button variant="secondary" className="px-4">← Trở về</Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Cập Nhật Hồ Sơ</h1>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message}
            </div>
          )}

          {/* =========================================
              THÔNG TIN THU NHẬP (CHỈ XEM)
             ========================================= */}
          <Card className="bg-slate-100 p-8 shadow-inner rounded-2xl border border-slate-200 mb-6">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-800">Thông Tin Thu Nhập & Thanh Toán</h2>
              <span className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-md text-xs font-bold flex items-center gap-1">
                🔒 Chỉ xem
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">Hệ số lương hiện tại</label>
                <input type="text" value={formData.heSoLuong} disabled className="w-full px-4 py-3 bg-slate-200 border border-slate-300 rounded-xl text-slate-600 font-bold cursor-not-allowed" />
                <p className="text-xs text-slate-500 leading-relaxed text-justify">
                  <span className="font-semibold text-slate-700">📌 Giải thích:</span> Đây là tỷ lệ phần trăm học phí bạn nhận được. Mặc định là <b>0.75</b> và có thể tăng tối đa lên <b>0.9</b> nếu bạn có nhiều học viên đăng ký. <br/>
                  <i className="mt-1 block text-blue-700">Ví dụ: Khóa học 10.000.000 VNĐ với hệ số 0.75, bạn sẽ nhận về 7.500.000 VNĐ.</i>
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">Lương hiện còn (VNĐ)</label>
                <input type="text" value={formData.luongHienCon.toLocaleString('vi-VN')} disabled className="w-full px-4 py-3 bg-slate-200 border border-slate-300 rounded-xl text-green-700 font-bold text-lg cursor-not-allowed text-right" />
                <p className="text-xs text-slate-500 leading-relaxed text-justify">
                  <span className="font-semibold text-slate-700">📌 Giải thích:</span> Số tiền hiển thị là số dư khả dụng có thể rút. Khi học viên đăng ký, tiền được giữ bởi Admin. Sau khi hoàn thành <b>50%</b> thời lượng khóa học, tiền sẽ tự động chuyển vào tài khoản của bạn.
                </p>
              </div>
            </div>
          </Card>

          {/* FORM CÁ NHÂN */}
          <Card className="bg-white p-8 shadow-md rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Thông Tin Cá Nhân</h2>
            <form onSubmit={handleSubmitProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên gia sư <span className="text-red-500">*</span></label>
                  <input type="text" name="tenGiaSu" value={formData.tenGiaSu} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                  <input type="tel" name="sdt" value={formData.sdt} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">CCCD (12 số) <span className="text-red-500">*</span></label>
                  <input type="text" name="cccd" value={formData.cccd} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold mt-4">
                {loading ? 'Đang lưu...' : '💾 Lưu Hồ Sơ'}
              </Button>
            </form>
          </Card>

          {/* FORM BẰNG CẤP */}
          <Card className="bg-white p-8 shadow-md rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Bằng Cấp Chuyên Môn</h2>
              <Button onClick={() => setShowBangCapForm(!showBangCapForm)} size="sm" className="bg-slate-800 hover:bg-slate-900">
                {showBangCapForm ? '✕ Hủy' : '＋ Thêm Bằng Cấp'}
              </Button>
            </div>

            {showBangCapForm && (
              <form onSubmit={handleAddBangCap} className="space-y-4 mb-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên văn bằng/Chứng chỉ <span className="text-red-500">*</span></label>
                  <input type="text" name="tenBangCap" value={bangCapForm.tenBangCap} onChange={handleBangCapChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Chi tiết <span className="text-red-500">*</span></label>
                  <textarea name="thongTinBangCap" value={bangCapForm.thongTinBangCap} onChange={handleBangCapChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày cấp <span className="text-red-500">*</span></label>
                    <input type="date" name="ngayCap" value={bangCapForm.ngayCap} onChange={handleBangCapChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  
                  {/* TRƯỜNG UPLOAD ẢNH BẰNG CẤP */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Ảnh minh chứng <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer transition-colors"
                      />
                      {uploadingImage && <span className="text-sm font-medium text-blue-600 animate-pulse w-32">Đang tải lên...</span>}
                    </div>

                    {bangCapForm.anhMinhChung && (
                      <div className="mt-4 relative w-48 h-32 border-2 border-dashed border-slate-300 rounded-lg overflow-hidden group shadow-sm">
                        <img 
                          src={bangCapForm.anhMinhChung} 
                          alt="Minh chứng" 
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <button
                          type="button"
                          onClick={() => setBangCapForm(prev => ({ ...prev, anhMinhChung: '' }))}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          title="Xóa ảnh"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <Button type="submit" disabled={loading || uploadingImage} size="sm">Gửi Yêu Cầu Duyệt</Button>
              </form>
            )}

            {bangCapList.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {bangCapList.map((bangCap, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-xl flex justify-between items-center bg-white shadow-sm">
                    <div className="flex gap-4 items-center">
                      {/* Thumbnail nhỏ của bằng cấp */}
                      {bangCap.anhMinhChung && (
                        <div className="w-16 h-12 bg-slate-100 rounded border border-slate-200 overflow-hidden flex-shrink-0">
                          <img src={bangCap.anhMinhChung} alt="BC" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800">{bangCap.tenBangCap}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            bangCap.trangThai === 1 
                              ? 'bg-green-100 text-green-700' 
                              : bangCap.trangThai === 2 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {bangCap.trangThai === 1 
                              ? 'Đã duyệt' 
                              : bangCap.trangThai === 2 
                              ? 'Từ chối' 
                              : 'Chờ duyệt'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Ngày cấp: {bangCap.ngayCap ? new Date(bangCap.ngayCap).toLocaleDateString('vi-VN') : 'N/A'}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleDeleteBangCap(index)} size="sm" variant="secondary" className="text-red-600 hover:bg-red-50 flex-shrink-0">
                      Xóa
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-6 text-slate-400">Chưa có bằng cấp nào.</p>
            )}
          </Card>
        </div>
      </Section>
    </main>
  );
}