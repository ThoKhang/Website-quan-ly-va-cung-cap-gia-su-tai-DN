"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  hocVienService,
  type ChiTietLichHocResponse,
} from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";
import {
  Home, ChevronRight, Loader2, BookOpen, GraduationCap,
  CalendarDays, Clock, Star, AlertCircle, TrendingUp,
  CheckCircle2, PlayCircle, PauseCircle, CircleDot, Hourglass,
  Banknote, FileText
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   HELPER: tính trạng thái hiển thị từ ngayHoc + giờ học
   Override trạng thái tĩnh từ DB (backend chưa tự cập nhật)
───────────────────────────────────────────────────────── */
function getDisplayStatus(schedule: ChiTietLichHocResponse): string {
  // Nếu đã nghỉ → giữ nguyên, không override
  if (schedule.tinhTrang === "Đã nghỉ") return "Đã nghỉ";

  const now = new Date();
  const ngayHoc = new Date(schedule.ngayHoc);

  // Ghép ngày học với giờ bắt đầu/kết thúc
  const [startH, startM] = schedule.lichDay.tietHoc.gioBatDau.split(":").map(Number);
  const [endH, endM]     = schedule.lichDay.tietHoc.gioKetThuc.split(":").map(Number);

  const startTime = new Date(ngayHoc);
  startTime.setHours(startH, startM, 0, 0);

  const endTime = new Date(ngayHoc);
  endTime.setHours(endH, endM, 0, 0);

  if (now < startTime) return "Chưa bắt đầu";
  if (now >= startTime && now <= endTime) return "Đang dạy";
  return "Đã hoàn thành";
}

/* ─────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<string, {
  bg: string; text: string; dot: string; icon: React.ReactNode
}> = {
  "Chưa bắt đầu": {
    bg: "#FAEEDA", text: "#854F0B", dot: "#BA7517",
    icon: <Hourglass size={12} />,
  },
  "Đang dạy": {
    bg: "#E6F1FB", text: "#185FA5", dot: "#2D7DD2",
    icon: <PlayCircle size={12} />,
  },
  "Đã hoàn thành": {
    bg: "#EAF3DE", text: "#3B6D11", dot: "#639922",
    icon: <CheckCircle2 size={12} />,
  },
  "Đã nghỉ": {
    bg: "#FAEEDA", text: "#854F0B", dot: "#BA7517",
    icon: <PauseCircle size={12} />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { bg: "#F1EFE8", text: "#444441", dot: "#888", icon: <CircleDot size={12} /> };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.icon}
      {status}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn, idNguoiDung } = useAuthStore();

  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [schedules, setSchedules]   = useState<ChiTietLichHocResponse[]>([]);
  const [bookingInfo, setBookingInfo] = useState<any>(null);

  const idDangKy = params.id as string;

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    fetchCourseDetail();
  }, [isLoggedIn, router, idDangKy, idNguoiDung]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      if (!idNguoiDung) { setError("Không tìm thấy thông tin người dùng"); return; }

      const courseDetail = await hocVienService.getCourseDetailById(idDangKy);
      if (courseDetail) {
        setBookingInfo(courseDetail);
        try {
          const scheduleData = await hocVienService.getScheduleDetail(idDangKy);
          setSchedules(scheduleData);
        } catch {
          setSchedules([]);
        }
      } else {
        setError("Không tìm thấy thông tin khóa học");
      }
    } catch (err: any) {
      if (err.status === 403 || err.status === 401) {
        setError("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(err.message || err.response?.data?.message || "Có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-500" size={36} />
        <p className="text-sm text-slate-500">Đang tải chi tiết khóa học…</p>
      </div>
    </div>
  );

  /* ── Not found ── */
  if (schedules.length === 0 && !bookingInfo) return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 w-full pt-5 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <nav className="flex items-center text-sm font-medium text-blue-200/70 mb-4">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5"><Home size={14} /> Trang chủ</Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <Link href="/hoc-vien/lich-su" className="hover:text-white transition-colors">Lịch sử đăng ký</Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <span className="text-white font-semibold">Chi tiết</span>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <AlertCircle size={40} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Không có dữ liệu</h2>
          <p className="text-sm text-slate-400 mb-6">{error || "Không tìm thấy lịch học cho khóa học này"}</p>
          <Link href="/hoc-vien/lich-su">
            <button className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors">
              Quay lại lịch sử
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  const khoaHoc = bookingInfo?.khoaHoc;
  const giaSu   = schedules.length > 0 ? schedules[0].lichDay.giaSu : khoaHoc?.giaSu;

  // Thống kê tiến độ theo trạng thái hiển thị
  const statusCounts = schedules.reduce((acc, s) => {
    const ds = getDisplayStatus(s);
    acc[ds] = (acc[ds] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const done  = (statusCounts["Đã hoàn thành"] || 0) + (statusCounts["Đã nghỉ"] || 0);
  const total = schedules.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ══ HERO BANNER ══ */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 w-full pt-5 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <nav className="flex items-center text-sm font-medium text-blue-200/70 mb-4 flex-wrap gap-y-1">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5"><Home size={14} /> Trang chủ</Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <Link href="/hoc-vien/lich-su" className="hover:text-white transition-colors">Lịch sử đăng ký</Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <span className="text-white font-semibold">Chi tiết khóa học</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">Chi tiết khóa học</h1>
          <p className="text-blue-200 text-sm font-medium max-w-xl">
            Xem thông tin đăng ký, thông tin gia sư và theo dõi lịch học chi tiết.
          </p>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" /> {error}
          </div>
        )}

        {/* ── GRID: Course info + Tutor info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* Thông tin khóa học */}
          {khoaHoc && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BookOpen size={16} className="text-blue-600" />
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Thông tin khóa học</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Tên khóa học", value: khoaHoc.tenKhoaHoc, accent: "#185FA5" },
                    { label: "Môn học",       value: khoaHoc.tenMonHoc,  accent: "#534AB7" },
                    { label: "Cấp lớp",       value: khoaHoc.tenLop,     accent: "#3B6D11" },
                    { label: "Số buổi học",   value: `${khoaHoc.soBuoiHoc} buổi`, accent: "#BA7517" },
                  ].map((row, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: row.accent }} />
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">{row.label}</p>
                        <p className="text-sm font-semibold text-slate-800">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-xs text-blue-500 mb-1 flex items-center gap-1"><Banknote size={11} /> Tổng học phí</p>
                    <p className="text-base font-bold text-blue-700">{fmtCurrency(Number(khoaHoc.soTienHoc))}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Banknote size={11} /> Giá / buổi</p>
                    <p className="text-base font-semibold text-slate-700">
                      {fmtCurrency(Number(khoaHoc.soTienHoc) / (khoaHoc.soBuoiHoc || 1))}
                    </p>
                  </div>
                </div>

                {(khoaHoc.moTa || khoaHoc.yeuCau) && (
                  <div className="mt-4 space-y-3 pt-4 border-t border-slate-100">
                    {khoaHoc.moTa && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <FileText size={11} /> Mô tả
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed">{khoaHoc.moTa}</p>
                      </div>
                    )}
                    {khoaHoc.yeuCau && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <FileText size={11} /> Yêu cầu
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed">{khoaHoc.yeuCau}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sidebar: Gia sư + Tiến độ */}
          <div className="space-y-4">

            {/* Gia sư */}
            {giaSu && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap size={16} className="text-indigo-600" />
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Gia sư</h2>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-base font-semibold text-indigo-700 flex-shrink-0">
                    {giaSu.tenGiaSu?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{giaSu.tenGiaSu}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      {giaSu.saoTrungBinh ?? 0}/5 · {giaSu.soLuongDanhGia ?? 0} đánh giá
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <BookOpen size={13} className="text-slate-400 flex-shrink-0" />
                  <p className="text-xs text-slate-600">
                    Đã dạy <span className="font-semibold text-slate-800">{giaSu.soLuongKhoaHoc ?? 0}</span> khóa học
                  </p>
                </div>
              </div>
            )}

            {/* Tiến độ */}
            {schedules.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Tiến độ</h2>
                </div>

                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Hoàn thành</span>
                  <span className="font-semibold text-emerald-700">{done}/{total} buổi · {pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                </div>

                <div className="space-y-1.5">
                  {Object.entries(statusCounts).map(([status, count]) => {
                    const cfg = STATUS_CONFIG[status];
                    if (!cfg) return null;
                    return (
                      <div key={status} className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{ background: cfg.bg }}>
                        <div className="flex items-center gap-2" style={{ color: cfg.text }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                          <span className="text-xs font-medium">{status}</span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: cfg.text }}>{count} buổi</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SCHEDULE TABLE ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <CalendarDays size={16} className="text-indigo-600" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                Lịch học chi tiết
              </h2>
              <span className="ml-auto text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                {schedules.length} buổi
              </span>
            </div>

            {schedules.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">Khóa học chưa bắt đầu, lịch học sẽ được cập nhật sau.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Buổi</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Ngày học</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Thứ</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Giờ học</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                      <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {schedules.map((schedule, index) => {
                      const displayStatus = getDisplayStatus(schedule);
                      const isDangDay = displayStatus === "Đang dạy";
                      return (
                        <tr
                          key={schedule.idLichHoc}
                          className={`transition-colors ${isDangDay ? "bg-blue-50/50" : "hover:bg-slate-50"}`}
                        >
                          <td className="py-3.5 px-3 font-semibold text-slate-700">
                            {index + 1}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600">
                            {new Date(schedule.ngayHoc).toLocaleDateString("vi-VN", {
                              day: "2-digit", month: "2-digit", year: "numeric",
                            })}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600">
                            {schedule.lichDay.tietHoc.thu}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600">
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-slate-400" />
                              {schedule.lichDay.tietHoc.gioBatDau.substring(0, 5)}
                              {" – "}
                              {schedule.lichDay.tietHoc.gioKetThuc.substring(0, 5)}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <StatusBadge status={displayStatus} />
                          </td>
                          <td className="py-3.5 px-3">
                            {displayStatus === "Chưa bắt đầu" && index > 0 && (
                              <Link href={`/hoc-vien/xin-nghi/${schedule.idLichHoc}`}>
                                <button className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                                  style={{ background: "#FAEEDA", color: "#854F0B", border: "0.5px solid #FAC775" }}
                                  onMouseOver={e => (e.currentTarget.style.background = "#FAC775")}
                                  onMouseOut={e => (e.currentTarget.style.background = "#FAEEDA")}>
                                  Xin nghỉ
                                </button>
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Back button */}
        <div className="flex justify-start">
          <Link href="/hoc-vien/lich-su">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <ChevronRight size={15} className="rotate-180" /> Quay lại lịch sử
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}