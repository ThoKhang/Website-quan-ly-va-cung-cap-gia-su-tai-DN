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

  // Bảng màu Pastel chuẩn Modern SaaS cho 7 ngày trong tuần
  const getThemeMap = (day: string) => {
    const themeMap: Record<string, { header: string; card: string; textAccent: string; badge: string }> = {
      'Thứ 2': { header: 'bg-blue-100 text-blue-800', card: 'bg-blue-50 border-blue-200', textAccent: 'text-blue-700', badge: 'bg-blue-200/50 text-blue-800' },
      'Thứ 3': { header: 'bg-purple-100 text-purple-800', card: 'bg-purple-50 border-purple-200', textAccent: 'text-purple-700', badge: 'bg-purple-200/50 text-purple-800' },
      'Thứ 4': { header: 'bg-pink-100 text-pink-800', card: 'bg-pink-50 border-pink-200', textAccent: 'text-pink-700', badge: 'bg-pink-200/50 text-pink-800' },
      'Thứ 5': { header: 'bg-orange-100 text-orange-800', card: 'bg-orange-50 border-orange-200', textAccent: 'text-orange-700', badge: 'bg-orange-200/50 text-orange-800' },
      'Thứ 6': { header: 'bg-emerald-100 text-emerald-800', card: 'bg-emerald-50 border-emerald-200', textAccent: 'text-emerald-700', badge: 'bg-emerald-200/50 text-emerald-800' },
      'Thứ 7': { header: 'bg-cyan-100 text-cyan-800', card: 'bg-cyan-50 border-cyan-200', textAccent: 'text-cyan-700', badge: 'bg-cyan-200/50 text-cyan-800' },
      'Chủ nhật': { header: 'bg-rose-100 text-rose-800', card: 'bg-rose-50 border-rose-200', textAccent: 'text-rose-700', badge: 'bg-rose-200/50 text-rose-800' },
    };
    return themeMap[day] || { header: 'bg-slate-100 text-slate-800', card: 'bg-slate-50 border-slate-200', textAccent: 'text-slate-700', badge: 'bg-slate-200/50 text-slate-800' };
  };

  useEffect(() => {
    const giaSuId = localStorage.getItem('idGiaSu');
    if (!giaSuId) {
      router.push('/login');
    } else {
      fetchLichBieu(giaSuId);
    }
  }, [router]);

  const fetchLichBieu = async (giaSuId: string) => {
    setLoading(true);
    try {
      const data = await giaSuService.getLichRanh(giaSuId);
      // Lọc ra các ca đã bị book (tinhTrang = false / 0)
      const booked = (data || []).filter((l: any) => l.tinhTrang === false || l.tinhTrang === 0 || String(l.tinhTrang) === 'false');
      setLichBieuList(booked);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return timeStr.includes('T') ? timeStr.split('T')[1].substring(0, 5) : timeStr.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
        <Loader2 className="animate-spin mb-4" size={40} />
        <span className="font-semibold">Đang tải thời khóa biểu...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Thời Khóa Biểu Giảng Dạy
          </h2>
          <p className="text-sm text-slate-500 mt-1">Lịch trình chi tiết các lớp bạn đang phụ trách trong tuần.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold border border-indigo-100">
          Tổng cộng: {lichBieuList.length} ca dạy
        </div>
      </div>

      {/* CONTAINER CUỘN NGANG CHO THỜI KHÓA BIỂU */}
      <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
        {/* Đặt min-width để các cột luôn giữ form chuẩn, không bị bóp méo trên điện thoại */}
        <div className="min-w-[1000px] grid grid-cols-7 gap-4">
          
          {daysOfWeek.map(day => {
            const theme = getThemeMap(day);
            const schedulesOfDay = lichBieuList
              .filter(l => l.tietHoc?.thu === day)
              .sort((a, b) => a.tietHoc.gioBatDau.localeCompare(b.tietHoc.gioBatDau));

            return (
              <div key={day} className="flex flex-col gap-4">
                
                {/* TIÊU ĐỀ CỘT (THỨ) */}
                <div className={`text-center font-bold py-3 rounded-xl uppercase text-sm tracking-wide ${theme.header}`}>
                  {day}
                </div>

                {/* DANH SÁCH CA DẠY TRONG NGÀY */}
                <div className="flex flex-col gap-3 h-full">
                  {schedulesOfDay.length === 0 ? (
                    // Trạng thái trống của từng cột để giữ form thời khóa biểu
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[120px] bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                      <CalendarX2 size={24} className="mb-2 opacity-50" />
                      <span className="text-xs font-medium">Trống</span>
                    </div>
                  ) : (
                    schedulesOfDay.map(lich => (
                      <div 
                        key={lich.idLichDay} 
                        className={`p-4 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col gap-3 ${theme.card}`}
                      >
                        {/* Thời gian */}
                        <div className={`flex items-center gap-1.5 font-bold text-sm w-fit px-2.5 py-1 rounded-md ${theme.badge}`}>
                          <Clock size={14} />
                          {formatTime(lich.tietHoc?.gioBatDau)} - {formatTime(lich.tietHoc?.gioKetThuc)}
                        </div>

                        {/* Tên Khóa Học */}
                        <div className={`font-bold leading-snug line-clamp-2 ${theme.textAccent}`} title={lich.tenKhoaHoc}>
                          {lich.tenKhoaHoc || 'Đang cập nhật khóa học'}
                        </div>

                        {/* Chi tiết HV & PH */}
                        <div className="space-y-1.5 mt-auto pt-2 border-t border-black/5">
                          <div className="flex items-start gap-1.5 text-xs font-medium text-slate-600">
                            <User size={13} className="shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{lich.tenHocVien || 'Chưa rõ'}</span>
                          </div>
                          {lich.sdtPhuHuynh && (
                            <div className="flex items-start gap-1.5 text-xs font-medium text-slate-600">
                              <Phone size={13} className="shrink-0 mt-0.5" />
                              <span className="font-bold">{lich.sdtPhuHuynh}</span>
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