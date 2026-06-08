"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { giaSuService } from '@/services/gia-su.service';
import { Clock, User, Phone, BookOpen, Loader2, CalendarX2 } from 'lucide-react';

interface TietHoc {
  idTietHoc: string;
  thu: string;
  gioBatDau: string;
  gioKetThuc: string;
  soTiet: number;
}

interface LichBieuItem {
  idLichDay: string;
  tietHoc: TietHoc;
  tinhTrang: boolean | number | string;
  tenKhoaHoc?: string;
  tenHocVien?: string;
  tenPhuHuynh?: string;
  sdtPhuHuynh?: string;
}

export default function ThoiKhoaBieuTab() {
  const router = useRouter();
  const [lichBieuList, setLichBieuList] = useState<LichBieuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  // Bảng màu pastel đồng bộ với phong cách thiết kế mới
  const getThemeMap = (day: string) => {
    const themeMap: Record<string, { header: string; card: string; textAccent: string; badge: string }> = {
      'Thứ 2': { header: 'bg-blue-50 text-blue-700 border-blue-200/50', card: 'border-blue-100 hover:border-blue-300', textAccent: 'text-blue-900', badge: 'bg-blue-100/80 text-blue-700' },
      'Thứ 3': { header: 'bg-purple-50 text-purple-700 border-purple-200/50', card: 'border-purple-100 hover:border-purple-300', textAccent: 'text-purple-900', badge: 'bg-purple-100/80 text-purple-700' },
      'Thứ 4': { header: 'bg-pink-50 text-pink-700 border-pink-200/50', card: 'border-pink-100 hover:border-pink-300', textAccent: 'text-pink-900', badge: 'bg-pink-100/80 text-pink-700' },
      'Thứ 5': { header: 'bg-orange-50 text-orange-700 border-orange-200/50', card: 'border-orange-100 hover:border-orange-300', textAccent: 'text-orange-900', badge: 'bg-orange-100/80 text-orange-700' },
      'Thứ 6': { header: 'bg-emerald-50 text-emerald-700 border-emerald-200/50', card: 'border-emerald-100 hover:border-emerald-300', textAccent: 'text-emerald-900', badge: 'bg-emerald-100/80 text-emerald-700' },
      'Thứ 7': { header: 'bg-cyan-50 text-cyan-700 border-cyan-200/50', card: 'border-cyan-100 hover:border-cyan-300', textAccent: 'text-cyan-900', badge: 'bg-cyan-100/80 text-cyan-700' },
      'Chủ nhật': { header: 'bg-rose-50 text-rose-700 border-rose-200/50', card: 'border-rose-100 hover:border-rose-300', textAccent: 'text-rose-900', badge: 'bg-rose-100/80 text-rose-700' },
    };
    return themeMap[day] || { header: 'bg-slate-50 text-slate-700 border-slate-200', card: 'border-slate-200 hover:border-slate-400', textAccent: 'text-slate-900', badge: 'bg-slate-100 text-slate-700' };
  };

  useEffect(() => {
    // Đưa hàm fetchLichBieu vào trong useEffect để fix lỗi scope / dependency
    const fetchLichBieu = async (giaSuId: string) => {
      setLoading(true);
      try {
        const data = await giaSuService.getLichRanh(giaSuId);
        const booked = (data || []).filter((l: any) => l.tinhTrang === false || l.tinhTrang === 0 || String(l.tinhTrang) === 'false');
        setLichBieuList(booked);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const giaSuId = localStorage.getItem('idGiaSu');
    if (!giaSuId) {
      router.push('/login');
    } else {
      fetchLichBieu(giaSuId);
    }
  }, [router]);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return timeStr.includes('T') ? timeStr.split('T')[1].substring(0, 5) : timeStr.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 mb-4">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
        <span className="text-sm font-bold text-slate-400 tracking-wide uppercase">Đang tải thời khóa biểu...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-8 animate-in fade-in zoom-in-[0.98] duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            Thời Khóa Biểu Giảng Dạy
          </h2>
          <p className="text-[15px] text-slate-500 mt-1.5 font-medium">Lịch trình chi tiết các lớp bạn đang phụ trách trong tuần.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl font-bold border border-blue-100/50 shadow-sm flex items-center gap-2.5 transition-all hover:shadow-md">
          <BookOpen size={18} className="text-blue-500" />
          <span>Tổng cộng: {lichBieuList.length} ca dạy</span>
        </div>
      </div>

      {/* KANBAN BOARD CA DẠY */}
      <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
        <div className="min-w-[1150px] grid grid-cols-7 gap-5">
          
          {daysOfWeek.map(day => {
            const theme = getThemeMap(day);
            const schedulesOfDay = lichBieuList
              .filter(l => l.tietHoc?.thu === day)
              .sort((a, b) => a.tietHoc.gioBatDau.localeCompare(b.tietHoc.gioBatDau));

            return (
              <div key={day} className="flex flex-col gap-4">
                
                {/* TIÊU ĐỀ CỘT */}
                <div className={`text-center font-bold py-3.5 rounded-2xl uppercase text-[13px] tracking-widest border-b-2 shadow-sm ${theme.header}`}>
                  {day}
                </div>

                {/* DANH SÁCH CA DẠY */}
                <div className="flex flex-col gap-4 h-full">
                  {schedulesOfDay.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[140px] bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:bg-slate-50">
                      <CalendarX2 size={28} strokeWidth={1.5} className="mb-2.5 text-slate-300" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Trống</span>
                    </div>
                  ) : (
                    schedulesOfDay.map(lich => (
                      <div 
                        key={lich.idLichDay} 
                        className={`group bg-white p-5 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col gap-4 cursor-default ${theme.card}`}
                      >
                        {/* Thời gian */}
                        <div className={`flex items-center gap-1.5 font-bold text-[13px] w-fit px-3.5 py-1.5 rounded-lg ${theme.badge}`}>
                          <Clock size={14} strokeWidth={2.5} />
                          {formatTime(lich.tietHoc?.gioBatDau)} - {formatTime(lich.tietHoc?.gioKetThuc)}
                        </div>

                        {/* Tên Khóa Học */}
                        <div className={`font-extrabold text-[15px] leading-snug line-clamp-2 ${theme.textAccent}`} title={lich.tenKhoaHoc}>
                          {lich.tenKhoaHoc || 'Đang cập nhật khóa học'}
                        </div>

                        {/* Chi tiết HV & PH */}
                        <div className="space-y-2.5 mt-auto pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-2.5 text-[13px] font-medium text-slate-600">
                            <div className="bg-slate-50 p-1.5 rounded-md border border-slate-100">
                              <User size={14} className="text-slate-500" strokeWidth={2} />
                            </div>
                            <span className="line-clamp-1 truncate">{lich.tenHocVien || 'Chưa rõ'}</span>
                          </div>
                          {lich.sdtPhuHuynh && (
                            <div className="flex items-center gap-2.5 text-[13px] font-medium text-slate-600">
                              <div className="bg-slate-50 p-1.5 rounded-md border border-slate-100">
                                <Phone size={14} className="text-slate-500" strokeWidth={2} />
                              </div>
                              <span className="font-bold tracking-wide">{lich.sdtPhuHuynh}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}