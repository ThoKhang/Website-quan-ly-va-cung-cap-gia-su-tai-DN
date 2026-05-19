"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Section } from "@/component/ui";
import { createCourse, getSubjects, getClassLevels, uploadCourseImage } from "@/services/khoa-hoc.service";
import type { KhoaHocRequestDTO } from "@/types/khoa-hoc.type";
import type { SubjectOption, ClassLevelOption } from "@/types/search.type";

export default function TaoKhoaHocPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [idGiaSu, setIdGiaSu] = useState<string | null>(null);
  
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevelOption[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tenKhoaHoc: '', 
    moTa: '', 
    yeuCau: '', 
    noiDungKhoaHoc: '',
    soTienHoc: 0, 
    soBuoiHoc: 0, 
    idMonHoc: '', 
    idDanhMucLop: '', 
    anhMinhHoa: '',
  });

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('idGiaSu');
      setIdGiaSu(id);
      if (id) loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      const [subs, levels] = await Promise.all([
        getSubjects().catch(() => []),
        getClassLevels().catch(() => [])
      ]);
      setSubjects(subs);
      setClassLevels(levels);
    } catch (err) {
      setError('Lỗi khi tải dữ liệu phụ trợ.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      const res = await uploadCourseImage(file);
      setFormData(prev => ({ ...prev, anhMinhHoa: res.fileUrl }));
    } catch (err) {
      setError('Lỗi tải ảnh lên.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Đã bỏ logic tiết học rảnh, gửi mảng rỗng [] cho Backend
      const submitData = {
        ...formData,
        idGiaSu: idGiaSu || '',
        danhSachIdTietHocRanh: [], 
      } as unknown as KhoaHocRequestDTO;

      await createCourse(submitData);
      alert('Tạo khóa học thành công! Hệ thống sẽ đưa bạn về danh sách.');
      router.push('/gia-su/khoa-hoc'); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi lưu khóa học');
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="page-shell bg-slate-50 min-h-screen pb-12">
      <Section>
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link href="/gia-su/khoa-hoc">
                <Button variant="secondary" className="px-4 bg-white shadow-sm border-slate-200 hover:bg-slate-100">
                  ← Trở về
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Tạo Khóa Học Mới</h1>
                <p className="text-sm text-slate-500 mt-1">Khóa học sau khi tạo sẽ được Admin kiểm duyệt trước khi hiển thị</p>
              </div>
            </div>
            
            {/* Nút submit phụ (Dành cho ai muốn bấm nhanh ở trên cùng) */}
            <Button 
              onClick={handleSubmit} 
              disabled={loading || uploading} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-md hidden md:flex"
            >
              {loading ? 'Đang tạo...' : '🚀 Xuất Bản Khóa Học'}
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-sm font-medium">
              ❌ {error}
            </div>
          )}

          {/* LAYOUT GRID 2 CỘT THÔNG MINH */}
          <form id="courseForm" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* CỘT TRÁI: THÔNG TIN CHI TIẾT (Chiếm 2 phần) */}
            <div className="xl:col-span-2 space-y-6">
              
              <Card className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span>📝</span> Thông Tin Cơ Bản
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên khóa học <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ví dụ: Tiếng Anh giao tiếp cho người mất gốc" 
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                      value={formData.tenKhoaHoc} 
                      onChange={e => setFormData({...formData, tenKhoaHoc: e.target.value})} 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả tổng quan <span className="text-red-500">*</span></label>
                    <textarea 
                      required 
                      placeholder="Viết một đoạn ngắn giới thiệu sự hấp dẫn của khóa học này..." 
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                      rows={3} 
                      value={formData.moTa} 
                      onChange={e => setFormData({...formData, moTa: e.target.value})} 
                    />
                  </div>
                </div>
              </Card>

              <Card className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span>🎯</span> Nội Dung & Yêu Cầu
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Lộ trình / Nội dung giảng dạy</label>
                    <textarea 
                      placeholder="Ghi rõ học viên sẽ học được những gì qua từng buổi..." 
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                      rows={4} 
                      value={formData.noiDungKhoaHoc} 
                      onChange={e => setFormData({...formData, noiDungKhoaHoc: e.target.value})} 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Yêu cầu đối với học viên</label>
                    <textarea 
                      placeholder="Ví dụ: Cần có máy tính, đã biết bảng chữ cái..." 
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
                      rows={2} 
                      value={formData.yeuCau} 
                      onChange={e => setFormData({...formData, yeuCau: e.target.value})} 
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* CỘT PHẢI: CẤU HÌNH & ẢNH BÌA (Chiếm 1 phần) */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* BLOCK 1: ẢNH BÌA */}
              <Card className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider text-center">Ảnh Bìa Khóa Học</h2>
                
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-6 hover:bg-slate-100 transition cursor-pointer overflow-hidden group min-h-[160px]">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    disabled={uploading} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  
                  {uploading ? (
                     <div className="text-center">
                       <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                       <p className="text-blue-600 text-xs font-bold">Đang tải...</p>
                     </div>
                  ) : formData.anhMinhHoa ? (
                    <>
                      <img src={formData.anhMinhHoa} alt="Cover" className="absolute inset-0 w-full h-full object-cover z-0" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center z-0">
                        <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-lg">Đổi ảnh khác</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-slate-400">
                      <span className="text-3xl block mb-2">📸</span>
                      <p className="text-xs font-medium">Bấm hoặc kéo thả ảnh vào đây</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* BLOCK 2: PHÂN LOẠI & GIÁ TIỀN */}
              <Card className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Cấu Hình Khóa Học</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Môn học <span className="text-red-500">*</span></label>
                    <select required className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.idMonHoc} onChange={e => setFormData({...formData, idMonHoc: e.target.value})}>
                      <option value="">-- Chọn môn --</option>
                      {subjects.map(s => <option key={s.idMonHoc} value={s.idMonHoc}>{s.tenMonHoc}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Cấp lớp <span className="text-red-500">*</span></label>
                    <select required className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.idDanhMucLop} onChange={e => setFormData({...formData, idDanhMucLop: e.target.value})}>
                      <option value="">-- Chọn lớp --</option>
                      {classLevels.map(c => <option key={c.idDanhMucLop} value={c.idDanhMucLop}>{c.tenLop}</option>)}
                    </select>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Giá học phí (VNĐ) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      required min="0" step="10000" 
                      placeholder="0"
                      className="w-full p-3 border border-slate-300 rounded-lg text-blue-700 font-bold text-lg bg-blue-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.soTienHoc || ''} 
                      onChange={e => setFormData({...formData, soTienHoc: Number(e.target.value)})} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Số buổi dự kiến <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      required min="1" 
                      placeholder="1"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.soBuoiHoc || ''} 
                      onChange={e => setFormData({...formData, soBuoiHoc: Number(e.target.value)})} 
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Button 
                    type="submit" 
                    disabled={loading || uploading} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-95"
                  >
                    {loading ? 'Đang khởi tạo...' : 'Lưu & Hoàn Thành'}
                  </Button>
                </div>
              </Card>

            </div>
          </form>

        </div>
      </Section>
    </main>
  );
}