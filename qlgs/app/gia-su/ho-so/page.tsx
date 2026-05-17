"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, Section } from "@/component/ui";
import { BangCap } from "@/types/auth.type";
import axiosClient from '@/services/axiosClient';

export default function GiaSuHoSoView() {
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({ tenGiaSu: '', sdt: '', cccd: '' });
  const [bangCapList, setBangCapList] = useState<BangCap[]>([]);
  const [message, setMessage] = useState('');

  const hasApprovedDegree = bangCapList.some(bc => bc.trangThai === true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchGiaSuInfo = async () => {
      try {
        const data: any = await axiosClient.get('/gia-su/thong-tin-hien-tai');
        
        // DÙNG DÒNG NÀY ĐỂ BẮT BỆNH LỖI MẤT BẰNG CẤP
        console.log("📦 DỮ LIỆU TỪ BACKEND TRẢ VỀ:", data);
        
        if (data.idGiaSu) localStorage.setItem('idGiaSu', data.idGiaSu);

        setFormData({
          tenGiaSu: data.tenGiaSu || '',
          sdt: data.sdt || '',
          cccd: data.cccd || '',
        });
        
        // Quét tìm mảng bằng cấp
        const rawBangCapList = data.bangCapList || data.danhSachBangCap || data.bangCaps || [];
        setBangCapList(Array.isArray(rawBangCapList) ? rawBangCapList : []);
        
      } catch (error: any) {
        setMessage('Lỗi kết nối đến máy chủ. Không thể tải hồ sơ.');
      }
    };

    fetchGiaSuInfo();
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <main className="page-shell bg-slate-50 min-h-screen pb-12">
      <Section>
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
          
          {message && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl font-medium shadow-sm">
              ❌ {message}
            </div>
          )}

          {!hasApprovedDegree && bangCapList.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm shadow-sm flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <p><span className="font-bold">Hồ sơ chưa kích hoạt:</span> Bạn cần ít nhất một chứng chỉ được duyệt để có thể tạo Khóa học.</p>
            </div>
          )}

          {/* CV HEADER CARD */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 w-44 h-44 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -left-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-lg"></div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl border-2 border-white/40 font-bold shadow-inner">
                  {formData.tenGiaSu ? formData.tenGiaSu.charAt(0).toUpperCase() : 'G'}
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight mb-1">
                    {formData.tenGiaSu || 'Chưa cập nhật họ tên'}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider">
                      Đối tác gia sư
                    </span>
                    {hasApprovedDegree ? (
                      <span className="px-2.5 py-0.5 bg-emerald-500 rounded-full text-xs font-semibold">✓ Đã xác minh</span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-amber-500 text-slate-900 rounded-full text-xs font-bold">⏱ Đang xác thực</span>
                    )}
                  </div>
                </div>
              </div>
              
              <Link href="/gia-su/ho-so/chinh-sua">
                <Button className="bg-white hover:bg-slate-100 text-blue-900 font-bold shadow-md px-6 w-full md:w-auto">
                  ✏️ Chỉnh Sửa Hồ Sơ
                </Button>
              </Link>
            </div>
          </div>

          {/* CV DETAILS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* THÔNG TIN LIÊN HỆ */}
            <Card className="bg-white p-6 shadow-sm rounded-2xl md:col-span-1 border border-slate-100 h-fit">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <span>📇</span> Thông Tin Liên Hệ
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Số điện thoại</label>
                  <span className="text-slate-700 font-medium text-base block">{formData.sdt ? `📞 ${formData.sdt}` : '▪ Chưa bổ sung'}</span>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Mã số định danh (CCCD)</label>
                  <span className="text-slate-700 font-medium text-base block">{formData.cccd ? `🪪 ${formData.cccd}` : '▪ Chưa bổ sung'}</span>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Mã gia sư</label>
                  <span className="text-slate-500 font-mono text-sm block">{typeof window !== 'undefined' ? localStorage.getItem('idGiaSu') : '...'}</span>
                </div>
              </div>
            </Card>

            {/* BẰNG CẤP */}
            <Card className="bg-white p-6 shadow-sm rounded-2xl md:col-span-2 border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <span>🎓</span> Học Vấn & Chứng Chỉ
              </h2>
              
              {bangCapList.length > 0 ? (
                <div className="relative pl-4 border-l-2 border-slate-200 space-y-6 my-2">
                  {bangCapList.map((bangCap, index) => (
                    <div key={index} className="relative group">
                      <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-white transition-colors ${bangCap.trangThai ? 'border-green-500 ring-4 ring-green-100' : 'border-amber-500 ring-4 ring-amber-100'}`}></div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h3 className="font-bold text-slate-900 text-base">{bangCap.tenBangCap}</h3>
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold shadow-sm flex-shrink-0 ${bangCap.trangThai ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                            {bangCap.trangThai ? '✓ Được duyệt' : '⏳ Chờ duyệt'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2 whitespace-pre-line">{bangCap.thongTinBangCap}</p>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-200/60 font-medium">
                          <span>📅 Ngày cấp: {bangCap.ngayCap ? new Date(bangCap.ngayCap).toLocaleDateString('vi-VN') : 'N/A'}</span>
                          {bangCap.anhMinhChung && (
                            <span className="text-blue-600 truncate max-w-[200px]">🔗 {bangCap.anhMinhChung}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm">Chưa có hồ sơ bằng cấp hoặc chứng chỉ nào.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Section>
    </main>
  );
}