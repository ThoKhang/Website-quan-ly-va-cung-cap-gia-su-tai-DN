"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hocVienService, type HocVienListItem } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";
import { 
  Home, ChevronRight, Edit2, Phone, CreditCard, 
  Calendar, MapPin, Users, AlertCircle, User 
} from "lucide-react";

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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-blue-600">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold animate-pulse">Đang tải hồ sơ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      
      {/* ══════════════════════════════════
          HERO BANNER & BREADCRUMBS
      ══════════════════════════════════ */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 w-full pt-5 pb-20 relative overflow-hidden">
        {/* Ánh sáng trang trí (Blur orbs) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm font-medium text-blue-200/70 mb-8">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Home size={14} /> Trang chủ
            </Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <Link href="/hoc-vien/ho-so" className="hover:text-white transition-colors">
              Hồ sơ
            </Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <span className="text-white font-bold">Thông tin cá nhân</span>
          </nav>

          {/* Profile Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-blue-600 border-[3px] border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-xl shrink-0">
                {phuHuynhInfo?.tenPhuHuynh ? getInitials(phuHuynhInfo.tenPhuHuynh) : <User size={32} />}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                  {phuHuynhInfo?.tenPhuHuynh || 'Chưa cập nhật họ tên'}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-100 border border-blue-400/30 font-bold tracking-wide backdrop-blur-sm">
                    Tài khoản Phụ huynh
                  </span>
                </div>
              </div>
            </div>
            
            <Link href="/hoc-vien/ho-so/chinh-sua">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold bg-white text-blue-900 hover:bg-blue-50 rounded-xl transition-all shadow-lg shadow-black/10">
                <Edit2 size={16} /> Chỉnh sửa hồ sơ
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-20 -mt-10 flex flex-col gap-6">
        
        {/* LỖI */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 shadow-sm">
            <AlertCircle size={20} className="shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* STAT CHIPS (Thẻ thông tin) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <Phone size={18} className="text-blue-600" />,
              iconBg: 'bg-blue-50',
              label: 'Số điện thoại',
              value: phuHuynhInfo?.sdt || '—',
            },
            {
              icon: <CreditCard size={18} className="text-emerald-600" />,
              iconBg: 'bg-emerald-50',
              label: 'CCCD',
              value: phuHuynhInfo?.cccd || '—',
            },
            {
              icon: <Calendar size={18} className="text-amber-600" />,
              iconBg: 'bg-amber-50',
              label: 'Ngày sinh',
              value: phuHuynhInfo?.ngaySinh ? new Date(phuHuynhInfo.ngaySinh).toLocaleDateString('vi-VN') : '—',
            },
            {
              icon: <MapPin size={18} className="text-purple-600" />,
              iconBg: 'bg-purple-50',
              label: 'Địa chỉ',
              value: phuHuynhInfo ? `${phuHuynhInfo.soNhaTenDuong || ''} ${phuHuynhInfo.phuongXa?.tenPhuongXa || ''} ${phuHuynhInfo.phuongXa?.quanHuyen?.tenQuanHuyen || ''}`.trim() || '—' : '—',
            },
          ].map((chip, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 ${chip.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                {chip.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{chip.label}</p>
                <p className="font-medium text-sm text-slate-800 line-clamp-2 leading-tight">
                  {chip.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* DANH SÁCH HỌC VIÊN */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm mt-4">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Users size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800">
              Danh Sách Học Viên ({hocVienList.length})
            </h2>
          </div>
          
          {hocVienList.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
              <Users size={48} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-700 mb-1">Chưa có học viên nào</h3>
              <p className="text-sm text-slate-500">Hồ sơ của bạn hiện tại chưa liên kết với học viên nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 px-6">Tên Học Viên</th>
                    <th className="py-4 px-6">Giới Tính</th>
                    <th className="py-4 px-6">Ngày Sinh</th>
                    <th className="py-4 px-6">CCCD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hocVienList.map((hocVien) => (
                    <tr key={hocVien.idHocVien} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {hocVien.tenHocVien}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600">
                        {hocVien.gioiTinh ? "Nam" : "Nữ"}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600">
                        {new Date(hocVien.ngaySinh).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600 font-mono text-xs">
                        {hocVien.cccd || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}