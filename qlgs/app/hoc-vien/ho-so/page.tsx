"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Text, Section } from "@/component/ui";
import { hocVienService, type HocVienListItem } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";

export default function HocVienProfilePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [phuHuynhInfo, setPhuHuynhInfo] = useState<any>(null);
  const [hocVienList, setHocVienList] = useState<HocVienListItem[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    fetchData();
  }, [isLoggedIn, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const phuHuynhData = await hocVienService.getPhuHuynhInfo();
      setPhuHuynhInfo(phuHuynhData);

      const hocVienData = await hocVienService.getHocVienList();
      setHocVienList(hocVienData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name.trim().split(' ').slice(-2).map(w => w[0]).join('').toUpperCase() || 'P';

  if (loading) {
    return (
      <main className="page-shell">
        <div className="content-lock px-6 py-10 md:px-10">
          <Text>Đang tải...</Text>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16 pt-8">
      <Section>
        <div className="max-w-5xl mx-auto px-4 flex flex-col gap-5">

          {/* LỖI */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* HERO CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            {/* Header nền xanh */}
            <div className="bg-blue-900 px-8 py-8 pb-14 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/5" />
              <div className="absolute left-1/2 -bottom-12 w-36 h-36 rounded-full bg-white/5" />
              <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center gap-5">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-blue-700 border-[3px] border-white/30 flex items-center justify-center text-2xl font-semibold text-blue-100 shrink-0">
                    {phuHuynhInfo?.tenPhuHuynh ? getInitials(phuHuynhInfo.tenPhuHuynh) : 'P'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-blue-50 mb-2 leading-tight">
                      {phuHuynhInfo?.tenPhuHuynh || 'Chưa cập nhật họ tên'}
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/15 text-blue-200 border border-white/20">
                        Phụ huynh
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/hoc-vien/ho-so/chinh-sua">
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-white/15 hover:bg-white/25 text-blue-100 border border-white/25 rounded-lg transition-colors">
                      ✏️ Chỉnh sửa hồ sơ
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stat chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-8 -mt-6 pb-6 relative z-10">
              {[
                {
                  icon: (
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  ),
                  iconBg: 'bg-blue-50',
                  label: 'Số điện thoại',
                  value: phuHuynhInfo?.sdt || '—',
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
                  value: phuHuynhInfo?.cccd || '—',
                  mono: false,
                },
                {
                  icon: (
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                    </svg>
                  ),
                  iconBg: 'bg-amber-50',
                  label: 'Ngày sinh',
                  value: phuHuynhInfo?.ngaySinh ? new Date(phuHuynhInfo.ngaySinh).toLocaleDateString('vi-VN') : '—',
                  mono: false,
                },
                {
                  icon: (
                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  ),
                  iconBg: 'bg-purple-50',
                  label: 'Địa chỉ',
                  value: phuHuynhInfo ? `${phuHuynhInfo.soNhaTenDuong || ''} ${phuHuynhInfo.phuongXa?.tenPhuongXa || ''} ${phuHuynhInfo.phuongXa?.quanHuyen?.tenQuanHuyen || ''}`.trim() || '—' : '—',
                  mono: false,
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

          {/* DANH SÁCH HỌC VIÊN */}
          <Card className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700">Danh Sách Học Viên ({hocVienList.length})</span>
            </div>
            
            {hocVienList.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl">
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z"/>
                </svg>
                <p className="text-sm text-slate-400">Chưa có học viên nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên Học Viên</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Giới Tính</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày Sinh</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">CCCD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hocVienList.map((hocVien) => (
                      <tr key={hocVien.idHocVien} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{hocVien.tenHocVien}</td>
                        <td className="py-3 px-4">{hocVien.gioiTinh ? "Nam" : "Nữ"}</td>
                        <td className="py-3 px-4">
                          {new Date(hocVien.ngaySinh).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="py-3 px-4">{hocVien.cccd || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </Section>
    </main>
  );
}
