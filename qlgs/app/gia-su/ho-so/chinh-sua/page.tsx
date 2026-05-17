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
  const [formData, setFormData] = useState({ tenGiaSu: '', sdt: '', cccd: '' });
  
  const [bangCapList, setBangCapList] = useState<BangCap[]>([]);
  const [showBangCapForm, setShowBangCapForm] = useState(false);
  const [bangCapForm, setBangCapForm] = useState({ tenBangCap: '', thongTinBangCap: '', ngayCap: '', anhMinhChung: '' });
  
  const [loading, setLoading] = useState(false);
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

  const handleAddBangCap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response: any = await axiosClient.post('/gia-su/them-bang-cap', bangCapForm);
      const newBangCap = { ...bangCapForm, idBangCap: response.idBangCap || Date.now().toString(), trangThai: false };
      setBangCapList([...bangCapList, newBangCap]);
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
      await axiosClient.put(`/gia-su/${idGiaSu}`, formData);
      
      // Thành công thì búng về trang hồ sơ
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
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên văn bằng/Chứng chỉ *</label>
                  <input type="text" name="tenBangCap" value={bangCapForm.tenBangCap} onChange={handleBangCapChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Chi tiết *</label>
                  <textarea name="thongTinBangCap" value={bangCapForm.thongTinBangCap} onChange={handleBangCapChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày cấp *</label>
                    <input type="date" name="ngayCap" value={bangCapForm.ngayCap} onChange={handleBangCapChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Link ảnh minh chứng *</label>
                    <input type="text" name="anhMinhChung" value={bangCapForm.anhMinhChung} onChange={handleBangCapChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                </div>
                <Button type="submit" disabled={loading} size="sm">Gửi Yêu Cầu Duyệt</Button>
              </form>
            )}

            {bangCapList.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {bangCapList.map((bangCap, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-xl flex justify-between items-center bg-white shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">{bangCap.tenBangCap}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${bangCap.trangThai ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {bangCap.trangThai ? 'Đã duyệt' : 'Chờ duyệt'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Ngày cấp: {bangCap.ngayCap ? new Date(bangCap.ngayCap).toLocaleDateString('vi-VN') : 'N/A'}</p>
                    </div>
                    <Button onClick={() => handleDeleteBangCap(index)} size="sm" variant="secondary" className="text-red-600 hover:bg-red-50">
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