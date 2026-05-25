"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Section } from "@/component/ui";
import { BangCap } from "@/types/auth.type";
import axiosClient from '@/services/axiosClient';

// ─── Icons ─────────────────────────────────────────────────────────────────
const IconPhone = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
  </svg>
);
const IconCard = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M9 14h8"/>
  </svg>
);
const IconHash = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
  </svg>
);
const IconGrad = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
    <path d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z"/>
  </svg>
);
const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>
);
const IconHome = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
  </svg>
);
const IconChevronRight = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path d="M9 18l6-6-6-6"/>
  </svg>
);
const IconCalendar = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconBarChart = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
  </svg>
);
const IconZap = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

function getInitials(name: string) {
  return name.trim().split(' ').slice(-2).map(w => w[0]).join('').toUpperCase() || 'G';
}

export default function GiaSuHoSoView() {
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({ tenGiaSu: '', sdt: '', cccd: '' });
  const [bangCapList, setBangCapList] = useState<BangCap[]>([]);
  const [idGiaSu, setIdGiaSu] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const hasApprovedDegree = bangCapList.some(bc => bc.trangThai === 1);
  const countApproved = bangCapList.filter(bc => bc.trangThai === 1).length;
  const countPending = bangCapList.filter(bc => bc.trangThai === 0).length;
  const countRejected = bangCapList.filter(bc => bc.trangThai === 2).length;

  useEffect(() => {
    setIsMounted(true);
    setIdGiaSu(typeof window !== 'undefined' ? localStorage.getItem('idGiaSu') : null);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const fetchGiaSuInfo = async () => {
      try {
        const data: any = await axiosClient.get('/gia-su/thong-tin-hien-tai');
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
    <main className="min-h-screen bg-[#F8FAFC] pb-20">

      {/* ══ HERO BANNER — giống file 1 ══ */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 w-full pt-5 pb-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">

          {/* Breadcrumb — y chang file 1 */}
          <nav className="flex items-center text-sm font-medium text-blue-200/70 mb-6">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
              <IconHome /> Trang chủ
            </Link>
            <IconChevronRight />
            <span className="mx-2" />
            <span className="text-white font-bold">Hồ sơ của tôi</span>
          </nav>

          {/* Profile hero row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl relative overflow-hidden border-2 border-white/20"
                style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)' }}>
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25), transparent 55%)' }} />
                <span className="relative z-10">{formData.tenGiaSu ? getInitials(formData.tenGiaSu) : 'G'}</span>
              </div>
              {hasApprovedDegree && (
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center shadow-lg">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/10 text-blue-200 border border-white/15">
                  Đối tác gia sư
                </span>
                {hasApprovedDegree ? (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Đã xác minh
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Đang xác thực
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-1.5 leading-tight">
                {formData.tenGiaSu || <span className="italic text-blue-200/60 font-medium text-xl">Chưa cập nhật họ tên</span>}
              </h1>
              <p className="text-blue-200/70 text-sm font-medium">
                Gia sư chuyên nghiệp · Hồ sơ cá nhân
              </p>
            </div>

            {/* Edit CTA */}
            <div className="shrink-0">
              <Link href="/gia-su/ho-so/chinh-sua">
                <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-all">
                  <IconEdit /> Chỉnh sửa hồ sơ
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MAIN CONTENT — nền trắng #F8FAFC ══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Alerts */}
        {message && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium text-red-700 bg-red-50 border border-red-200">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {message}
          </div>
        )}
        {!hasApprovedDegree && bangCapList.length > 0 && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Hồ sơ chưa kích hoạt đầy đủ — cần ít nhất một chứng chỉ được duyệt để tạo khóa học.
          </div>
        )}

        {/* Info chips row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { icon: <IconPhone />, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', label: 'Số điện thoại', value: formData.sdt || '—', mono: false },
            { icon: <IconCard />,  iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', label: 'CCCD', value: formData.cccd || '—', mono: false },
            { icon: <IconHash />,  iconBg: 'bg-amber-50',   iconColor: 'text-amber-600',   label: 'Mã gia sư', value: idGiaSu || '—', mono: true },
          ].map((chip, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm shadow-blue-900/5">
              <div className={`w-10 h-10 ${chip.iconBg} ${chip.iconColor} rounded-xl flex items-center justify-center shrink-0`}>
                {chip.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 mb-0.5 font-semibold uppercase tracking-wider">{chip.label}</p>
                <p className={`font-semibold truncate ${chip.mono ? 'font-mono text-xs text-slate-500' : 'text-sm text-slate-800'}`}>
                  {chip.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Stat sidebar ── */}
          <div className="flex flex-col gap-5">

            {/* Overview card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-2.5 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <IconBarChart />
                </div>
                <span className="text-sm font-black text-slate-800">Tổng quan hồ sơ</span>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-sm text-slate-500">Tổng chứng chỉ</span>
                  <span className="text-2xl font-black text-slate-800">{bangCapList.length}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-sm text-emerald-700 font-medium">Đã duyệt</span>
                  <span className="text-2xl font-black text-emerald-600">{countApproved}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="text-sm text-amber-700 font-medium">Chờ duyệt</span>
                  <span className="text-2xl font-black text-amber-500">{countPending}</span>
                </div>
                {countRejected > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                    <span className="text-sm text-red-700 font-medium">Bị từ chối</span>
                    <span className="text-2xl font-black text-red-500">{countRejected}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <span className={`w-2 h-2 rounded-full ${hasApprovedDegree ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  <span className={`text-sm font-bold ${hasApprovedDegree ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {hasApprovedDegree ? 'Tài khoản đã xác minh' : 'Đang chờ xác minh'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick actions card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <IconZap /> Thao tác nhanh
                </span>
              </div>
              <div className="p-4 flex flex-col gap-2">
                <Link href="/gia-su/ho-so/chinh-sua" className="w-full">
                  <button className="w-full text-sm font-bold py-2.5 px-4 rounded-xl text-left flex items-center gap-2 text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors">
                    <IconEdit /> Chỉnh sửa hồ sơ
                  </button>
                </Link>
                <Link href="/gia-su/khoa-hoc/tao-moi" className="w-full">
                  <button className="w-full text-sm font-bold py-2.5 px-4 rounded-xl text-left flex items-center gap-2 text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors">
                    <IconGrad /> Tạo khóa học mới
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Degrees panel ── */}
          <div className="md:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-2.5 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <IconGrad />
              </div>
              <span className="text-sm font-black text-slate-800">Học vấn &amp; Chứng chỉ</span>
              {bangCapList.length > 0 && (
                <span className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {bangCapList.length} mục
                </span>
              )}
            </div>

            <div className="p-6">
              {bangCapList.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {bangCapList.map((bc, i) => {
                    const isApproved = bc.trangThai === 1;
                    const isRejected = bc.trangThai === 2;

                    const dotColor = isApproved ? 'bg-emerald-500' : isRejected ? 'bg-red-500' : 'bg-amber-400';
                    const lineColor = isApproved ? 'bg-emerald-200' : isRejected ? 'bg-red-200' : 'bg-amber-200';
                    const cardBg = isApproved ? 'bg-emerald-50 border-emerald-100' : isRejected ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100';
                    const badgeCls = isApproved
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : isRejected
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : 'bg-amber-100 text-amber-700 border-amber-200';

                    return (
                      <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border hover:shadow-sm transition-shadow ${cardBg}`}>
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                          {i < bangCapList.length - 1 && (
                            <span className={`w-px flex-1 min-h-[20px] ${lineColor}`} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3 mb-1">
                            <p className="text-sm font-bold text-slate-800 leading-snug">{bc.tenBangCap}</p>
                            <span className={`self-start shrink-0 text-[10px] px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1 uppercase tracking-wide ${badgeCls}`}>
                              {isApproved ? '✓ Đã duyệt' : isRejected ? '✕ Từ chối' : '⏳ Chờ duyệt'}
                            </span>
                          </div>
                          {bc.thongTinBangCap && (
                            <p className="text-xs text-slate-500 mb-2 leading-relaxed">{bc.thongTinBangCap}</p>
                          )}
                          <div className="flex items-center gap-4 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <IconCalendar />
                              {bc.ngayCap ? new Date(bc.ngayCap).toLocaleDateString('vi-VN') : 'Chưa có ngày cấp'}
                            </span>
                            {bc.anhMinhChung && (
                              <a href={bc.anhMinhChung} target="_blank" rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 transition-colors truncate max-w-[160px]">
                                Xem minh chứng →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <IconGrad />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">Chưa có hồ sơ bằng cấp nào</p>
                  <p className="text-xs text-slate-400">Thêm chứng chỉ để kích hoạt tài khoản gia sư</p>
                  <Link href="/gia-su/ho-so/chinh-sua">
                    <button className="mt-5 px-5 py-2 text-sm font-bold rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-colors">
                      + Thêm chứng chỉ
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}