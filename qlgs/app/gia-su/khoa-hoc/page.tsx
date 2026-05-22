"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Section, Text } from "@/component/ui";
import { useAuthStore } from "@/store/auth.store";
import { getCoursesByTutor, deleteCourse } from "@/services/khoa-hoc.service";
import type { KhoaHoc } from "@/types/khoa-hoc.type";

export default function DanhSachKhoaHocPage() {
  const router = useRouter();
  const { idNguoiDung, loaiNguoiDungID } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [idGiaSu, setIdGiaSu] = useState<string | null>(null);
  
  const [allCourses, setAllCourses] = useState<KhoaHoc[]>([]);
  const [filterStatus, setFilterStatus] = useState<number | 'ALL'>('ALL');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    useAuthStore.getState().loadFromStorage();
    if (typeof window !== 'undefined') {
      setIdGiaSu(localStorage.getItem('idGiaSu'));
    }
  }, []);

  useEffect(() => {
    if (isMounted && idGiaSu && loaiNguoiDungID === '2') {
      loadCourses();
    }
  }, [isMounted, idGiaSu, loaiNguoiDungID]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!idGiaSu) {
        setError('Vui lòng đăng nhập lại để xem khóa học');
        return;
      }
      const coursesRes = await getCoursesByTutor(idGiaSu);
      setAllCourses(Array.isArray(coursesRes) ? coursesRes : []);
    } catch (err: any) {
      setError('Lỗi khi tải danh sách khóa học.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác!')) return;
    try {
      setLoading(true);
      await deleteCourse(id);
      setSuccess('Xóa khóa học thành công!');
      setAllCourses(prev => prev.filter(c => c.idKhoaHoc !== id));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi xóa khóa học');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: number) => {
    switch (status) {
      case 1: return <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold uppercase tracking-wider border border-emerald-300 shadow-sm">Đã duyệt</span>;
      case 2: return <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-xs font-extrabold uppercase tracking-wider border border-red-300 shadow-sm">Từ chối</span>;
      default: return <span className="px-3 py-1.5 bg-[#fef3c7] text-[#d97706] rounded-full text-xs font-extrabold uppercase tracking-wider border border-[#fcd34d] shadow-sm">Chờ duyệt</span>;
    }
  };

  const displayedCourses = filterStatus === 'ALL' 
    ? allCourses 
    : allCourses.filter(c => c.trangThai === filterStatus);

  const countAll = allCourses.length;
  const countApproved = allCourses.filter(c => c.trangThai === 1).length;
  const countPending = allCourses.filter(c => c.trangThai === 0 || c.trangThai == null).length;
  const countRejected = allCourses.filter(c => c.trangThai === 2).length;

  if (!isMounted) return null;

  return (
    <main className="page-shell bg-slate-50 min-h-screen pb-12 pt-6">
      <Section>
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center gap-4 mb-8">
            <Link href="/#gia-su-features">
              <Button variant="secondary" className="px-4 bg-white shadow-sm border-slate-200 hover:bg-slate-100 text-slate-600">
                ← Bảng Điều Khiển
              </Button>
            </Link>
            <div>
              <Text as="h1" size="hero" className="text-slate-900 mb-1 leading-none">Trung Tâm Khóa Học</Text>
              <Text size="caption" tone="muted">Không gian làm việc và quản lý giáo trình của Gia sư</Text>
            </div>
          </div>

          {/* MESSAGES */}
          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 shadow-sm flex items-center gap-2"><span>❌</span> {error}</div>}
          {success && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 shadow-sm flex items-center gap-2"><span>✨</span> {success}</div>}
          {!idGiaSu && <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 shadow-sm flex items-center gap-2"><span>⚠️</span> Phiên đăng nhập hết hạn.</div>}

          {/* LAYOUT GRID 2 CỘT */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* CỘT TRÁI: SIDEBAR (Giữ nguyên bố cục chuẩn của bạn) */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold mb-2 text-slate-800">Sáng tạo nội dung</h2>
                <p className="text-sm text-slate-500 mb-6">Đóng gói kiến thức của bạn thành những khóa học chất lượng.</p>
                <Link href="/gia-su/khoa-hoc/tao-moi" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md font-bold py-3 rounded-xl transition-transform active:scale-95">
                    ＋ Tạo Khóa Học Mới
                  </Button>
                </Link>
              </Card>

              <Card className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Phân loại trạng thái</h3>
                <nav className="flex flex-col gap-1.5">
                  <button onClick={() => setFilterStatus('ALL')} className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${filterStatus === 'ALL' ? 'bg-[#1e293b] text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg leading-none">📚</span><span>Tất cả khóa học</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${filterStatus === 'ALL' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{countAll}</span>
                  </button>
                  <button onClick={() => setFilterStatus(1)} className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${filterStatus === 1 ? 'bg-[#1e293b] text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg leading-none opacity-80">✓</span><span>Đang hoạt động</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${filterStatus === 1 ? 'bg-slate-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>{countApproved}</span>
                  </button>
                  <button onClick={() => setFilterStatus(0)} className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${filterStatus === 0 ? 'bg-[#1e293b] text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg leading-none opacity-80">⏳</span><span>Chờ phê duyệt</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${filterStatus === 0 ? 'bg-slate-600 text-white' : 'bg-amber-100 text-amber-700'}`}>{countPending}</span>
                  </button>
                  <button onClick={() => setFilterStatus(2)} className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${filterStatus === 2 ? 'bg-[#1e293b] text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg leading-none opacity-80">✕</span><span>Cần chỉnh sửa</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${filterStatus === 2 ? 'bg-slate-600 text-white' : 'bg-red-100 text-red-700'}`}>{countRejected}</span>
                  </button>
                </nav>
              </Card>
            </div>

            {/* CỘT PHẢI: HIỂN THỊ DANH SÁCH (Đã fix sắc nét 100%) */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <Text size="body" tone="muted">Đang tải không gian làm việc...</Text>
                </div>
              ) : allCourses.length === 0 ? (
                <div className="bg-white py-28 px-4 text-center rounded-3xl border border-dashed border-slate-300 shadow-sm flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6"><span className="text-5xl">🎒</span></div>
                  <Text as="h3" size="display" className="text-slate-800 mb-2">Chưa có dữ liệu</Text>
                  <Text size="body" tone="muted" className="mb-8 max-w-md mx-auto">Bạn chưa xuất bản khóa học nào. Hãy sử dụng bảng điều khiển bên trái để bắt đầu tạo khóa học mới.</Text>
                </div>
              ) : displayedCourses.length === 0 ? (
                <div className="bg-white py-24 text-center rounded-3xl border border-slate-200 shadow-sm">
                  <span className="text-4xl block mb-4 opacity-50">🔍</span>
                  <Text size="body" tone="muted">Không có khóa học nào nằm trong danh mục này.</Text>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {displayedCourses.map(course => (
                    <Card key={course.idKhoaHoc} className="bg-white rounded-[1.5rem] shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col group p-4">
                      
                      {/* KHỐI ẢNH BÌA (Ảnh rõ nét, không bị mờ nhạt) */}
                      <div className="w-full h-44 bg-slate-100 relative overflow-hidden rounded-xl mb-4 border border-slate-200">
                        {course.anhMinhHoa ? (
                          <img src={course.anhMinhHoa} alt={course.tenKhoaHoc} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
                            <span className="text-4xl opacity-40 mb-2">🖼️</span>
                            <span className="text-slate-500 text-sm font-medium">Chưa có ảnh bìa</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 z-10">
                          {getStatusBadge(course.trangThai)}
                        </div>
                      </div>

                      {/* KHỐI NỘI DUNG CHÍNH */}
                      <div className="flex-1 flex flex-col px-1">
                        <div className="mb-4">
                          <h3 className="font-extrabold text-[20px] text-blue-700 leading-snug line-clamp-2 mb-3" title={course.tenKhoaHoc}>
                            {course.tenKhoaHoc}
                          </h3>
                          <div className="flex items-center justify-between">
                            <p className="text-blue-600 font-black text-2xl">
                              {course.soTienHoc.toLocaleString('vi-VN')} <span className="text-base font-bold">đ</span>
                            </p>
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                              {course.soBuoiHoc} Buổi
                            </span>
                          </div>
                        </div>
                        
                        {/* TAGS MÔN LỚP (Ép màu sắc nét) */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 flex items-center gap-1.5">
                            📚 {course.tenMonHoc}
                          </span>
                          <span className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold border border-sky-200 flex items-center gap-1.5">
                            🎓 {course.tenLop}
                          </span>
                        </div>

                        {/* HÀNG NÚT BẤM (Bo tròn viên thuốc - Chữ nổi bật 100%) */}
                        <div className="flex gap-3 pt-4 border-t border-slate-100 mt-auto">
                          
                          {/* Nút Sửa: Cam rõ nét */}
                          <Button 
                            onClick={() => router.push(`/gia-su/khoa-hoc/chinh-sua/${course.idKhoaHoc}`)} 
                            className="flex-1 bg-orange-50 hover:bg-orange-100 !text-orange-600 border border-orange-200 shadow-sm text-sm font-extrabold h-11 rounded-full flex justify-center items-center gap-1.5"
                          >
                            ✏️ Sửa
                          </Button>
                          
                          {/* Nút Xem: Xanh rõ nét */}
                          <Link href={`/gia-su/khoa-hoc/${course.idKhoaHoc}`} className="flex-[1.2]">
                            <Button className="w-full bg-blue-50 hover:bg-blue-100 !text-blue-700 border border-blue-200 shadow-sm text-sm font-extrabold h-11 rounded-full flex justify-center items-center gap-1.5">
                              👁 Xem
                            </Button>
                          </Link>
                          
                          {/* Nút Xóa: Đỏ rõ nét */}
                          <Button 
                            onClick={() => handleDelete(course.idKhoaHoc)} 
                            className="flex-[0.8] bg-red-50 hover:bg-red-100 !text-red-600 border border-red-200 shadow-sm h-11 px-0 flex justify-center items-center rounded-full font-extrabold gap-1.5"
                            title="Xóa khóa học"
                          >
                            🗑 Xóa
                          </Button>
                          
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </Section>
    </main>
  );
}