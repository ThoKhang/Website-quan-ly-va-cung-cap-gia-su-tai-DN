"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Section } from "@/component/ui";
import { BangCap } from "@/types/auth.type";
import axiosClient from '@/services/axiosClient';

export default function GiaSuHoSoView() {
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({ tenGiaSu: '', sdt: '', cccd: '' });
  const [bangCapList, setBangCapList] = useState<BangCap[]>([]);
  const [idGiaSu, setIdGiaSu] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const hasApprovedDegree = bangCapList.some(bc => bc.trangThai === true);
  const countApproved = bangCapList.filter(bc => bc.trangThai === true).length;
  const countPending = bangCapList.filter(bc => bc.trangThai !== true).length;

  const getInitials = (name: string) =>
    name.trim().split(' ').slice(-2).map(w => w[0]).join('').toUpperCase() || 'G';

  useEffect(() => {
    setIsMounted(true);
    setIdGiaSu(typeof window !== 'undefined' ? localStorage.getItem('idGiaSu') : null);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const fetchGiaSuInfo = async () => {
      try {
        const data: any = await axiosClient.get('/gia-su/thong-tin-hien-tai');
        console.log("📦 DỮ LIỆU TỪ BACKEND TRẢ VỀ:", data);
        if (data.idGiaSu) {
          localStorage.setItem('idGiaSu', data.idGiaSu);
          setIdGiaSu(data.idGiaSu);
        }
        setFormData({ tenGiaSu: data.tenGiaSu || '', sdt: data.sdt || '', cccd: data.cccd || '' });
        const rawList = data.bangCapList || data.danhSachBangCap || data.bangCaps || [];
        setBangCapList(Array.isArray(rawList) ? rawList : []);
      } catch {
        setMessage('Lỗi kết nối đến máy chủ. Không thể tải hồ sơ.');
      }
    };
    fetchGiaSuInfo();
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 pb-16 pt-8">
      <Section>
        <div className="max-w-5xl mx-auto px-4 flex flex-col gap-5">

          {/* LỖI */}
          {message && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {message}
            </div>
          )}

          {/* CẢNH BÁO */}
          {!hasApprovedDegree && bangCapList.length > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Hồ sơ chưa kích hoạt đầy đủ — cần ít nhất một chứng chỉ được duyệt để tạo khóa học.
            </div>
          )}

          {/* HERO CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {/* Header nền xanh */}
            <div className="bg-blue-900 px-8 py-8 pb-14 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/5" />
              <div className="absolute left-1/2 -bottom-12 w-36 h-36 rounded-full bg-white/5" />
              <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-5">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-blue-700 border-[3px] border-white/30 flex items-center justify-center text-2xl font-semibold text-blue-100 shrink-0">
                    {formData.tenGiaSu ? getInitials(formData.tenGiaSu) : 'G'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-blue-50 mb-2 leading-tight">
                      {formData.tenGiaSu || 'Chưa cập nhật họ tên'}
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/15 text-blue-200 border border-white/20">
                        Đối tác gia sư
                      </span>
                      {hasApprovedDegree ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Đã xác minh
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Đang xác thực
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link href="/gia-su/ho-so/chinh-sua">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-white/15 hover:bg-white/25 text-blue-100 border border-white/25 rounded-lg transition-colors">
                    ✏️ Chỉnh sửa hồ sơ
                  </button>
                </Link>
              </div>
            </div>

            {/* Stat chips nổi lên header */}
            <div className="grid grid-cols-3 gap-3 px-8 -mt-6 pb-6 relative z-10">
              {[
                {
                  icon: (
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  ),
                  iconBg: 'bg-blue-50',
                  label: 'Số điện thoại',
                  value: formData.sdt || '—',
                  mono: false,
                },
                {
                  icon: (
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M9 14h8"/>
                    </svg>
                  ),
                  iconBg: 'bg-green-50',
                  label: 'CCCD',
                  value: formData.cccd || '—',
                  mono: false,
                },
                {
                  icon: (
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                    </svg>
                  ),
                  iconBg: 'bg-amber-50',
                  label: 'Mã gia sư',
                  value: idGiaSu || '—',
                  mono: true,
                },
              ].map((chip, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className={`w-9 h-9 ${chip.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                    {chip.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400 mb-0.5">{chip.label}</p>
                    <p className={`font-medium truncate ${chip.mono ? 'font-mono text-xs text-slate-500' : 'text-sm text-slate-800'}`}>
                      {chip.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Tổng quan */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-700">Tổng quan hồ sơ</span>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-500">Tổng chứng chỉ</span>
                  <span className="text-2xl font-semibold text-slate-800">{bangCapList.length}</span>
                </div>
                <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between">
                  <span className="text-sm text-green-700">Đã duyệt</span>
                  <span className="text-2xl font-semibold text-green-700">{countApproved}</span>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                  <span className="text-sm text-amber-700">Chờ duyệt</span>
                  <span className="text-2xl font-semibold text-amber-700">{countPending}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${hasApprovedDegree ? 'bg-green-500' : 'bg-amber-400'}`} />
                  <span className={`text-sm font-medium ${hasApprovedDegree ? 'text-green-700' : 'text-amber-700'}`}>
                    {hasApprovedDegree ? 'Tài khoản đã xác minh' : 'Đang chờ xác minh'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bằng cấp */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                    <path d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-700">Học vấn &amp; chứng chỉ</span>
              </div>
              <div className="p-5">
                {bangCapList.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {bangCapList.map((bc, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                        {/* Trục dot */}
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${bc.trangThai ? 'bg-green-500' : 'bg-amber-400'}`} />
                          {i < bangCapList.length - 1 && (
                            <span className={`w-px flex-1 min-h-[20px] ${bc.trangThai ? 'bg-green-200' : 'bg-amber-200'}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <p className="text-sm font-semibold text-slate-800 leading-snug">{bc.tenBangCap}</p>
                            <span className={`shrink-0 text-[10px] px-2.5 py-0.5 rounded-full border font-medium flex items-center gap-1 ${
                              bc.trangThai
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {bc.trangThai ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
                            </span>
                          </div>
                          {bc.thongTinBangCap && (
                            <p className="text-xs text-slate-500 mb-2 leading-relaxed">{bc.thongTinBangCap}</p>
                          )}
                          <div className="flex items-center gap-4 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                              {bc.ngayCap ? new Date(bc.ngayCap).toLocaleDateString('vi-VN') : 'Chưa có ngày cấp'}
                            </span>
                            {bc.anhMinhChung && (
                              <span className="text-blue-500 truncate max-w-[180px]">{bc.anhMinhChung}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl">
                    <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                      <path d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z"/>
                    </svg>
                    <p className="text-sm text-slate-400">Chưa có hồ sơ bằng cấp hoặc chứng chỉ nào.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </Section>
    </main>
  );
}