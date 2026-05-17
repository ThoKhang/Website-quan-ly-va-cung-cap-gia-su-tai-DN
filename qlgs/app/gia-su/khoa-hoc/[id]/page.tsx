"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Section } from "@/component/ui";
import { getCourseDetail, deleteCourse } from "@/services/khoa-hoc.service";
import type { KhoaHoc } from "@/types/khoa-hoc.type";

export default function ChiTietKhoaHocGiaSuPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [course, setCourse] = useState<KhoaHoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getCourseDetail(id);
      setCourse(res as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: number) => {
    switch (status) {
      case 1: return <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Đang hoạt động</span>;
      case 2: return <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Bị từ chối</span>;
      case -1: return <span className="text-xs px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" /> Đã lưu trữ</span>;
      default: return <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Đang chờ duyệt</span>;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center text-slate-500">Không tìm thấy dữ liệu khóa học.</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-16 pt-8">
      <Section>
        <div className="max-w-5xl mx-auto px-4 flex flex-col gap-5">
          
          {/* THANH ĐIỀU HƯỚNG */}
          <div className="flex items-center gap-2 mb-2">
            <Link href="/gia-su/khoa-hoc">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                ← Quay lại danh sách
              </button>
            </Link>
          </div>

          {/* HERO CARD - Bố cục y hệt Hồ Sơ Cá Nhân */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Header nền xanh */}
            <div className="bg-blue-900 px-8 py-8 pb-14 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/5" />
              <div className="absolute left-1/4 -bottom-12 w-36 h-36 rounded-full bg-white/5" />
              <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/15 text-blue-200 border border-white/20 uppercase tracking-wider font-bold">
                      Khóa học trực tuyến
                    </span>
                    {getStatusBadge(course.trangThai)}
                  </div>
                  <h1 className="text-3xl font-bold text-white leading-tight max-w-2xl">
                    {course.tenKhoaHoc}
                  </h1>
                  <p className="text-blue-200 text-sm max-w-2xl line-clamp-2">
                    {course.moTa || "Chưa có mô tả chi tiết cho khóa học này."}
                  </p>
                </div>

                {/* Các nút Hành động đặt góc phải */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => router.push(`/gia-su/khoa-hoc/chinh-sua/${id}`)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-white/15 hover:bg-white/25 text-blue-100 border border-white/25 rounded-lg transition-colors"
                  >
                    ✏️ Chỉnh sửa
                  </button>
                  <button 
                    onClick={async () => {
                      if(confirm("Bạn có chắc muốn xóa khóa học này?")) {
                         await deleteCourse(id);
                         router.push('/gia-su/khoa-hoc');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-red-500/80 hover:bg-red-500 text-white border border-red-500/50 rounded-lg transition-colors"
                  >
                    🗑
                  </button>
                </div>

              </div>
            </div>

            {/* Stat chips nổi lên header (Chứa thông số quan trọng) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-8 -mt-6 pb-6 relative z-10">
              {[
                {
                  icon: <span className="text-lg">💰</span>,
                  iconBg: 'bg-blue-50',
                  label: 'Giá học phí',
                  value: `${course.soTienHoc.toLocaleString('vi-VN')} đ`,
                  valueClass: 'text-blue-600 font-bold'
                },
                {
                  icon: <span className="text-lg">⏱</span>,
                  iconBg: 'bg-indigo-50',
                  label: 'Thời lượng',
                  value: `${course.soBuoiHoc} buổi học`,
                  valueClass: 'text-indigo-700 font-bold'
                },
                {
                  icon: <span className="text-lg">📚</span>,
                  iconBg: 'bg-amber-50',
                  label: 'Môn học',
                  value: course.tenMonHoc,
                  valueClass: 'text-amber-800'
                },
                {
                  icon: <span className="text-lg">🎓</span>,
                  iconBg: 'bg-emerald-50',
                  label: 'Cấp lớp',
                  value: course.tenLop,
                  valueClass: 'text-emerald-800'
                },
              ].map((chip, i) => (
                <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className={`w-10 h-10 ${chip.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                    {chip.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400 mb-0.5 uppercase tracking-wider">{chip.label}</p>
                    <p className={`truncate text-sm ${chip.valueClass}`}>
                      {chip.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM GRID (Chia 2 cột) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">

            {/* CỘT TRÁI: Ảnh Bìa & Đánh giá (Chiếm 1/3) */}
            <div className="flex flex-col gap-5 md:col-span-1">
              
              {/* Box Ảnh Bìa */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Ảnh đại diện khóa học</span>
                </div>
                <div className="p-4">
                  <div className="w-full aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                    {course.anhMinhHoa ? (
                      <img src={course.anhMinhHoa} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                        <span className="text-3xl mb-1">🖼️</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Trống</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Box Đánh giá & ID */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mã hồ sơ</span>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{course.idKhoaHoc}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đánh giá chung</span>
                  <span className="text-sm font-bold text-amber-500 flex items-center gap-1">
                    ⭐ {course.saoTrungBinh || '0.0'}
                  </span>
                </div>
              </div>

            </div>

            {/* CỘT PHẢI: Chi tiết Lộ trình & Yêu cầu (Chiếm 2/3) */}
            <div className="md:col-span-2 flex flex-col gap-5">
              
              {/* Box Lộ trình */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 text-sm">🎯</div>
                  <span className="text-sm font-medium text-slate-700">Nội dung & Lộ trình giảng dạy</span>
                </div>
                <div className="p-6 bg-slate-50/50">
                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {course.noiDungKhoaHoc || "Chưa có thông tin lộ trình giảng dạy cho khóa học này."}
                  </div>
                </div>
              </div>

              {/* Box Yêu cầu */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center text-red-600 text-sm">⚠️</div>
                  <span className="text-sm font-medium text-slate-700">Yêu cầu đối với học viên</span>
                </div>
                <div className="p-6">
                  <div className="text-sm text-slate-600 italic border-l-4 border-red-100 pl-4 py-1">
                    {course.yeuCau ? `"${course.yeuCau}"` : "Không có yêu cầu đầu vào đặc biệt nào."}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </Section>
    </main>
  );
}