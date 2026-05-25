"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { hocVienService, type DangKyHocResponse } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";
import {
  BookOpen, Clock, X, CreditCard, Loader2, GraduationCap,
  CalendarDays, ChevronRight, Star, AlertTriangle, CheckCircle2,
  PlayCircle, RefreshCcw, TrendingUp, XCircle, Hourglass
} from "lucide-react";
import { PAYMENT_CONFIG } from "@/config/payment.config";

const fmtDate = (s?: string) => s
  ? new Date(s).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" })
  : "—";
const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style:"currency", currency:"VND" }).format(v);

const getStatus = (b: DangKyHocResponse): "Chưa bắt đầu"|"Đang học"|"Đã hoàn thành" => {
  const today = new Date(); today.setHours(0,0,0,0);
  const start = new Date(b.ngayBatDauHoc); start.setHours(0,0,0,0);
  const list = b.chiTietLichHoc || [];
  let end = start;
  if (list.length > 0) { end = new Date(list[list.length-1].ngayHoc); end.setHours(0,0,0,0); }
  if (today < start) return "Chưa bắt đầu";
  if (today > end) return "Đã hoàn thành";
  return "Đang học";
};

// ✅ Component badge trạng thái gia hạn
function GiaHanBadge({ trangThai, soBuoi, onThanhToan }: {
  trangThai: string;
  soBuoi?: number;
  onThanhToan?: () => void;
}) {
  if (trangThai === "Chờ duyệt") return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
      <Hourglass size={13} className="text-amber-500 flex-shrink-0"/>
      <span className="text-xs font-bold text-amber-700">Chờ gia sư duyệt gia hạn {soBuoi ? `(+${soBuoi} buổi)` : ""}</span>
    </div>
  );
  if (trangThai === "Từ chối") return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200">
      <XCircle size={13} className="text-red-500 flex-shrink-0"/>
      <span className="text-xs font-bold text-red-700">Gia sư đã từ chối gia hạn</span>
    </div>
  );
  if (trangThai === "Chờ thanh toán" || trangThai === "Đã duyệt") return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200">
      <CheckCircle2 size={13} className="text-blue-500 flex-shrink-0"/>
      <span className="text-xs font-bold text-blue-700 flex-1">Gia sư đã duyệt! Chờ thanh toán {soBuoi ? `(+${soBuoi} buổi)` : ""}</span>
      {onThanhToan && (
        <button onClick={onThanhToan}
          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex-shrink-0">
          Thanh toán
        </button>
      )}
    </div>
  );
  if (trangThai === "Đã hoàn thành") return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
      <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0"/>
      <span className="text-xs font-bold text-emerald-700">Đã gia hạn thành công {soBuoi ? `(+${soBuoi} buổi)` : ""}</span>
    </div>
  );
  return null;
}

export default function BookingHistoryPage() {
  const router = useRouter();
  const { isLoggedIn, idNguoiDung } = useAuthStore();

  const [loading, setLoading]   = useState(true);
  const [bookings, setBookings] = useState<DangKyHocResponse[]>([]);
  const [tab, setTab]           = useState<"dang_hoc"|"chua_bt"|"hoan_thanh">("dang_hoc");

  // Modal thanh toán lần đầu
  const [payingBooking,  setPayingBooking]  = useState<DangKyHocResponse|null>(null);
  const [paySubmitting,  setPaySubmitting]  = useState(false);
  const [payError,       setPayError]       = useState("");
  const [paySuccess,     setPaySuccess]     = useState("");

  // Modal gia hạn
  const [extBook,       setExtBook]       = useState<DangKyHocResponse|null>(null);
  const [extLoading,    setExtLoading]    = useState(false);
  const [extSubmitting, setExtSubmitting] = useState(false);
  const [extError,      setExtError]      = useState("");
  const [extSuccess,    setExtSuccess]    = useState("");
  const [extState,      setExtState]      = useState<"form"|"cho_duyet"|"thanh_toan">("form");
  const [extType,       setExtType]       = useState<"Toàn bộ"|"Tùy chọn">("Toàn bộ");
  const [extSessions,   setExtSessions]   = useState(1);
  const [extId,         setExtId]         = useState("");

  // Modal thanh toán gia hạn (mở từ badge trên card)
  const [payExtBook,    setPayExtBook]    = useState<DangKyHocResponse|null>(null);
  const [payExtSubmit,  setPayExtSubmit]  = useState(false);
  const [payExtError,   setPayExtError]   = useState("");
  const [payExtSuccess, setPayExtSuccess] = useState("");

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    fetchData();
  }, [isLoggedIn, idNguoiDung]);

  const fetchData = async () => {
    if (!idNguoiDung) return;
    setLoading(true);
    try {
      const data = await hocVienService.getBookingHistory(idNguoiDung);
      setBookings(data.sort((a,b) => new Date(b.ngayDangKy).getTime() - new Date(a.ngayDangKy).getTime()));
    } catch {}
    finally { setLoading(false); }
  };

  // ── PHÂN LOẠI ──
  const chuaThanhToan = bookings.filter(b => b.trangThaiThanhToan === false);
  const dangHoc       = bookings.filter(b => b.trangThaiThanhToan !== false && getStatus(b) === "Đang học");
  const chuaBatDau    = bookings.filter(b => b.trangThaiThanhToan !== false && getStatus(b) === "Chưa bắt đầu");
  const daHoanThanh   = bookings.filter(b => b.trangThaiThanhToan !== false && getStatus(b) === "Đã hoàn thành");

  const tabConfig = [
    { key:"dang_hoc"    as const, label:"Đang học",     count:dangHoc.length,    icon:PlayCircle,   color:"#10b981" },
    { key:"chua_bt"     as const, label:"Chưa bắt đầu", count:chuaBatDau.length, icon:Clock,        color:"#f59e0b" },
    { key:"hoan_thanh"  as const, label:"Hoàn thành",   count:daHoanThanh.length,icon:CheckCircle2, color:"#6366f1" },
  ];
  const displayed = tab==="dang_hoc" ? dangHoc : tab==="chua_bt" ? chuaBatDau : daHoanThanh;

  // ── THANH TOÁN LẦN ĐẦU ──
  const handleFirstPay = async () => {
    if (!payingBooking) return;
    try {
      setPaySubmitting(true); setPayError("");
      await hocVienService.xacNhanThanhToan(payingBooking.idDangKy, payingBooking.khoaHoc.soTienHoc);
      setPaySuccess("Thanh toán thành công! Khóa học đã được kích hoạt.");
      fetchData();
      setTimeout(() => setPayingBooking(null), 2000);
    } catch (e: any) { setPayError(e?.message || "Lỗi thanh toán!"); }
    finally { setPaySubmitting(false); }
  };

  // ── GIA HẠN ──
  const openExtend = async (b: DangKyHocResponse) => {
    // Nếu đã có đơn, mở thẳng trạng thái tương ứng
    if (b.trangThaiGiaHan === "Chờ duyệt") {
      setExtBook(b); setExtState("cho_duyet"); setExtError(""); setExtSuccess(""); return;
    }
    if (b.trangThaiGiaHan === "Chờ thanh toán" || b.trangThaiGiaHan === "Đã duyệt") {
      setExtBook(b); setExtState("thanh_toan");
      setExtId(b.idYeuCauGiaHan || "");
      setExtSessions(b.soBuoiGiaHan || 1);
      setExtType((b.loaiGiaHan as any) || "Toàn bộ");
      setExtError(""); setExtSuccess(""); return;
    }
    setExtBook(b); setExtState("form"); setExtType("Toàn bộ");
    setExtSessions(1); setExtError(""); setExtSuccess("");
  };

  const submitExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extBook) return;
    try {
      setExtSubmitting(true); setExtError("");
      await hocVienService.guiYeuCauGiaHan(extBook.idDangKy, {
        soBuoiGiaHan: extType === "Toàn bộ" ? extBook.khoaHoc.soBuoiHoc : extSessions,
        loaiGiaHan: extType
      });
      setExtSuccess("Đã gửi yêu cầu gia hạn!");
      setExtState("cho_duyet");
      fetchData();
    } catch (e: any) { setExtError(e?.message || "Có lỗi xảy ra!"); }
    finally { setExtSubmitting(false); }
  };

  const confirmExtendPay = async () => {
    try {
      setExtSubmitting(true); setExtError("");
      await hocVienService.xacNhanThanhToanGiaHan(extId);
      setExtSuccess("Thanh toán gia hạn thành công!");
      fetchData();
      setTimeout(() => setExtBook(null), 2000);
    } catch (e: any) { setExtError(e?.message || "Lỗi thanh toán!"); }
    finally { setExtSubmitting(false); }
  };

  // ── THANH TOÁN GIA HẠN TỪ BADGE ──
  const confirmPayExtFromBadge = async () => {
    if (!payExtBook?.idYeuCauGiaHan) return;
    try {
      setPayExtSubmit(true); setPayExtError("");
      await hocVienService.xacNhanThanhToanGiaHan(payExtBook.idYeuCauGiaHan);
      setPayExtSuccess("Thanh toán gia hạn thành công!");
      fetchData();
      setTimeout(() => setPayExtBook(null), 2000);
    } catch (e: any) { setPayExtError(e?.message || "Lỗi!"); }
    finally { setPayExtSubmit(false); }
  };

  const extDonGia = extBook ? extBook.khoaHoc.soTienHoc / extBook.khoaHoc.soBuoiHoc : 0;
  const extPrice  = extType === "Toàn bộ" ? (extBook?.khoaHoc.soTienHoc ?? 0) : extSessions * extDonGia;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-violet-500" size={32}/>
        <p className="text-slate-400 text-sm font-medium">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

          {/* ── CỘT TRÁI ── */}
          <div className="space-y-4 lg:sticky lg:top-6">

            {/* Header card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm">
                  <GraduationCap size={20} className="text-white"/>
                </div>
                <div>
                  <h1 className="font-black text-slate-900 text-base leading-tight">Hồ sơ học tập</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Quản lý khóa học của bạn</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label:"Đang học",     val:dangHoc.length,    bg:"bg-emerald-100", text:"text-emerald-700", dot:"bg-emerald-500" },
                  { label:"Chưa bắt đầu",val:chuaBatDau.length, bg:"bg-amber-100",   text:"text-amber-700",  dot:"bg-amber-500"   },
                  { label:"Hoàn thành",   val:daHoanThanh.length,bg:"bg-violet-100",  text:"text-violet-700", dot:"bg-violet-500"  },
                ].map((s,i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl ${s.bg}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`}/>
                      <span className={`text-sm font-semibold ${s.text}`}>{s.label}</span>
                    </div>
                    <span className={`text-2xl font-black ${s.text}`}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chờ thanh toán */}
            {chuaThanhToan.length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-amber-300 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-600"/>
                  <span className="text-sm font-bold text-amber-800">Chờ thanh toán ({chuaThanhToan.length})</span>
                </div>
                {chuaThanhToan.map(b => (
                  <div key={b.idDangKy} className="p-4 border-b border-amber-50 last:border-0">
                    <p className="font-bold text-slate-800 text-sm truncate mb-1">{b.khoaHoc.tenKhoaHoc}</p>
                    <p className="text-xs text-slate-400 mb-3">{b.khoaHoc.tenGiaSu}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-600">{fmtCurrency(b.khoaHoc.soTienHoc)}</span>
                      <button onClick={() => { setPayingBooking(b); setPayError(""); setPaySuccess(""); }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors">
                        Thanh toán
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick link */}
            <Link href="/search">
              <div className="bg-violet-600 hover:bg-violet-700 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-colors group">
                <div>
                  <p className="font-bold text-white text-sm">Tìm khóa học mới</p>
                  <p className="text-violet-200 text-xs mt-0.5">Khám phá gia sư phù hợp</p>
                </div>
                <ChevronRight size={18} className="text-violet-300 group-hover:translate-x-1 transition-transform"/>
              </div>
            </Link>
          </div>

          {/* ── CỘT PHẢI ── */}
          <div>
            {/* Tabs */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-4 shadow-sm">
              {tabConfig.map(t => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all"
                    style={active ? { background: t.color, color:"white" } : { color:"#94a3b8" }}
                  >
                    <Icon size={14}/>
                    <span className="hidden sm:inline">{t.label}</span>
                    <span className="text-xs opacity-80">({t.count})</span>
                  </button>
                );
              })}
            </div>

            {/* List */}
            {displayed.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                <BookOpen size={36} className="text-slate-200 mx-auto mb-3"/>
                <p className="font-bold text-slate-300 text-lg">Không có khóa học nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayed.map(b => {
                  const status = getStatus(b);
                  const done   = b.chiTietLichHoc.filter((c:any) => c.tinhTrang === "Đã hoàn thành").length;
                  const total  = b.khoaHoc.soBuoiHoc;
                  const pct    = total > 0 ? Math.round((done/total)*100) : 0;

                  // ✅ Kiểm tra có đơn gia hạn active không
                  const hasActiveGiaHan = b.trangThaiGiaHan &&
                    ["Chờ duyệt","Đã duyệt","Chờ thanh toán","Đã hoàn thành"].includes(b.trangThaiGiaHan);
                  const canExtend = status === "Đang học" && !hasActiveGiaHan;

                  const statusCfg = {
                    "Đang học":      { dot:"bg-emerald-500", text:"text-emerald-700", bg:"bg-emerald-100", bar:"bg-emerald-500" },
                    "Chưa bắt đầu": { dot:"bg-amber-500",   text:"text-amber-700",   bg:"bg-amber-100",   bar:"bg-amber-500"   },
                    "Đã hoàn thành":{ dot:"bg-violet-400",  text:"text-violet-600",  bg:"bg-violet-100",  bar:"bg-violet-400"  },
                  }[status];

                  return (
                    <div key={b.idDangKy}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start gap-3">
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden border border-slate-100">
                            {b.khoaHoc.anhMinhHoa ? (
                              <img src={b.khoaHoc.anhMinhHoa} alt="" className="w-full h-full object-cover"/>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                                <BookOpen size={18} className="text-violet-400"/>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}/>
                                {status}
                              </span>
                              <span className="text-xs text-slate-300">#{b.idDangKy}</span>
                            </div>
                            <h3 className="font-black text-slate-900 leading-tight truncate">{b.khoaHoc.tenKhoaHoc}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Gia sư: <span className="text-slate-600 font-semibold">{b.khoaHoc.tenGiaSu}</span>
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="font-black text-slate-900">{fmtCurrency(b.khoaHoc.soTienHoc)}</p>
                            <p className="text-xs text-slate-400">{total} buổi</p>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-400 flex items-center gap-1">
                              <TrendingUp size={11}/> Tiến độ
                            </span>
                            <span className={`font-bold ${statusCfg.text}`}>{done}/{total} buổi · {pct}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${statusCfg.bar}`}
                              style={{ width:`${pct}%` }}/>
                          </div>
                        </div>

                        {/* Ngày */}
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                            <CalendarDays size={11}/>
                            Bắt đầu: <strong className="text-slate-700 ml-1">{fmtDate(b.ngayBatDauHoc)}</strong>
                          </span>
                          {b.ngayKetThucDuKien && (
                            <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                              <Clock size={11}/>
                              Kết thúc: <strong className="text-slate-700 ml-1">{fmtDate(b.ngayKetThucDuKien)}</strong>
                            </span>
                          )}
                        </div>

                        {/* ✅ BADGE TRẠNG THÁI GIA HẠN */}
                        {b.trangThaiGiaHan && (
                          <div className="mt-3">
                            <GiaHanBadge
                              trangThai={b.trangThaiGiaHan}
                              soBuoi={b.soBuoiGiaHan}
                              onThanhToan={
                                (b.trangThaiGiaHan === "Chờ thanh toán" || b.trangThaiGiaHan === "Đã duyệt")
                                  ? () => { setPayExtBook(b); setPayExtError(""); setPayExtSuccess(""); }
                                  : undefined
                              }
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                        <Link href={`/hoc-vien/chi-tiet/${b.idDangKy}`} className="flex-1">
                          <button className="w-full py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center gap-1 transition-all">
                            Xem lịch học <ChevronRight size={12}/>
                          </button>
                        </Link>

                        {/* ✅ Nút gia hạn chỉ hiện khi chưa có đơn active */}
                        {canExtend && (
                          <button onClick={() => openExtend(b)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white transition-all">
                            + Gia hạn
                          </button>
                        )}

                        {/* Nút mờ khi đang chờ duyệt */}
                        {status === "Đang học" && b.trangThaiGiaHan === "Chờ duyệt" && (
                          <button disabled
                            className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 cursor-not-allowed">
                            Đang chờ duyệt...
                          </button>
                        )}

                        {status === "Đã hoàn thành" && (
                          <Link href={`/hoc-vien/danh-gia/${b.idDangKy}`} className="flex-1">
                            <button className="w-full py-2 rounded-xl text-xs font-bold bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 flex items-center justify-center gap-1 transition-all">
                              <Star size={12}/> Đánh giá
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ MODAL THANH TOÁN LẦN ĐẦU ══ */}
      {payingBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-900">Thanh toán khóa học</h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{payingBooking.khoaHoc.tenKhoaHoc}</p>
              </div>
              <button onClick={() => setPayingBooking(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                <X size={16}/>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {payError   && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2"><AlertTriangle size={14}/>{payError}</div>}
              {paySuccess && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm flex items-center gap-2"><CheckCircle2 size={14}/>{paySuccess}</div>}
              {!paySuccess && <>
                <div className="flex justify-center">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    {PAYMENT_CONFIG.qrCodeUrl
                      ? <img src={PAYMENT_CONFIG.qrCodeUrl} alt="QR" className="w-44 h-44 rounded-xl"/>
                      : <div className="w-44 h-44 bg-slate-100 rounded-xl flex items-center justify-center"><p className="text-slate-400 text-sm">QR Code</p></div>}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Số buổi</span><span className="font-bold">{payingBooking.khoaHoc.soBuoiHoc} buổi</span></div>
                  <div className="flex justify-between pt-2 border-t border-slate-200"><span className="text-slate-500 font-bold">Tổng tiền</span><span className="font-black text-violet-600 text-lg">{fmtCurrency(payingBooking.khoaHoc.soTienHoc)}</span></div>
                </div>
                <p className="text-xs text-slate-400 text-center">Nội dung: <strong>Dat lop - {payingBooking.idDangKy}</strong></p>
                <button onClick={handleFirstPay} disabled={paySubmitting}
                  className="w-full py-3 rounded-xl font-black text-white bg-violet-600 hover:bg-violet-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                  {paySubmitting ? <Loader2 size={16} className="animate-spin"/> : <CreditCard size={16}/>}
                  {paySubmitting ? "Đang xử lý..." : "Xác nhận đã chuyển khoản"}
                </button>
              </>}
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL THANH TOÁN GIA HẠN (từ badge) ══ */}
      {payExtBook && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-900">Thanh toán gia hạn</h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{payExtBook.khoaHoc.tenKhoaHoc}</p>
              </div>
              <button onClick={() => setPayExtBook(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                <X size={16}/>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {payExtError   && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2"><AlertTriangle size={14}/>{payExtError}</div>}
              {payExtSuccess && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm flex items-center gap-2"><CheckCircle2 size={14}/>{payExtSuccess}</div>}
              {!payExtSuccess && <>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600"/>
                  <p className="text-sm font-bold text-emerald-800">Gia sư đã phê duyệt gia hạn!</p>
                </div>
                <div className="flex justify-center">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    {PAYMENT_CONFIG.qrCodeUrl
                      ? <img src={PAYMENT_CONFIG.qrCodeUrl} alt="QR" className="w-44 h-44 rounded-xl"/>
                      : <div className="w-44 h-44 bg-slate-100 rounded-xl flex items-center justify-center"><p className="text-slate-400 text-sm">QR Code</p></div>}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Số buổi gia hạn</span><span className="font-bold">+{payExtBook.soBuoiGiaHan} buổi</span></div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-bold">Số tiền</span>
                    <span className="font-black text-violet-600 text-lg">
                      {fmtCurrency((payExtBook.khoaHoc.soTienHoc / payExtBook.khoaHoc.soBuoiHoc) * (payExtBook.soBuoiGiaHan || 0))}
                    </span>
                  </div>
                </div>
                <button onClick={confirmPayExtFromBadge} disabled={payExtSubmit}
                  className="w-full py-3 rounded-xl font-black text-white bg-violet-600 hover:bg-violet-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                  {payExtSubmit ? <Loader2 size={16} className="animate-spin"/> : <CreditCard size={16}/>}
                  {payExtSubmit ? "Đang xử lý..." : "Xác nhận đã chuyển khoản"}
                </button>
              </>}
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL GIA HẠN ══ */}
      {extBook && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-900 flex items-center gap-2"><RefreshCcw size={17} className="text-violet-500"/> Gia hạn khóa học</h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[260px]">{extBook.khoaHoc.tenKhoaHoc}</p>
              </div>
              <button onClick={() => setExtBook(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                <X size={16}/>
              </button>
            </div>
            <div className="p-6">
              {extLoading ? (
                <div className="flex flex-col items-center py-10"><Loader2 className="animate-spin text-violet-400 mb-3" size={28}/><p className="text-slate-400 text-sm">Đang kiểm tra...</p></div>
              ) : (
                <>
                  {extError   && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2"><AlertTriangle size={14}/>{extError}</div>}
                  {extSuccess && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm flex items-center gap-2"><CheckCircle2 size={14}/>{extSuccess}</div>}

                  {extState === "form" && (
                    <form onSubmit={submitExtend} className="space-y-4">
                      <p className="text-sm font-bold text-slate-700">Chọn hình thức gia hạn:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {(["Toàn bộ","Tùy chọn"] as const).map(type => (
                          <label key={type} className="cursor-pointer rounded-xl p-4 border-2 transition-all block"
                            style={extType===type ? { borderColor:"#7c3aed", background:"#faf5ff" } : { borderColor:"#e2e8f0" }}>
                            <div className="flex items-center gap-2 mb-3">
                              <input type="radio" checked={extType===type}
                                onChange={() => { setExtType(type); setExtSessions(type==="Toàn bộ" ? extBook.khoaHoc.soBuoiHoc : 1); }}
                                className="w-4 h-4 accent-violet-600"/>
                              <span className="font-bold text-slate-900 text-sm">{type==="Toàn bộ" ? "Toàn bộ" : "Tùy chọn"}</span>
                            </div>
                            {type==="Toàn bộ" ? (
                              <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <p className="text-xs text-slate-400">+{extBook.khoaHoc.soBuoiHoc} buổi</p>
                                <p className="font-black text-violet-600">{fmtCurrency(extBook.khoaHoc.soTienHoc)}</p>
                              </div>
                            ) : extType==="Tùy chọn" ? (
                              <div className="space-y-2">
                                <input type="number" min="1" value={extSessions}
                                  onChange={e => setExtSessions(parseInt(e.target.value)||1)}
                                  onClick={e => e.stopPropagation()}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold"/>
                                <div className="bg-white rounded-lg p-3 border border-slate-100">
                                  <p className="text-xs text-slate-400">{fmtCurrency(extDonGia)}/buổi</p>
                                  <p className="font-black text-violet-600">{fmtCurrency(extSessions*extDonGia)}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-slate-50 rounded-lg p-3 opacity-50">
                                <p className="text-xs text-slate-400">Chọn để nhập số buổi</p>
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                      <button type="submit" disabled={extSubmitting}
                        className="w-full py-3 rounded-xl font-black text-white bg-violet-600 hover:bg-violet-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                        {extSubmitting ? <Loader2 size={16} className="animate-spin"/> : null}
                        {extSubmitting ? "Đang gửi..." : "Gửi yêu cầu gia hạn"}
                      </button>
                    </form>
                  )}

                  {extState === "cho_duyet" && (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 rounded-2xl bg-amber-100 mx-auto mb-4 flex items-center justify-center">
                        <Hourglass size={28} className="text-amber-500"/>
                      </div>
                      <h3 className="font-black text-slate-900 text-lg mb-2">Chờ gia sư xác nhận</h3>
                      <p className="text-slate-400 text-sm max-w-xs mx-auto">Yêu cầu đã gửi. Bạn sẽ thấy thông báo ngay trên thẻ khóa học khi gia sư phê duyệt.</p>
                      <button onClick={() => setExtBook(null)}
                        className="mt-5 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">
                        Đóng
                      </button>
                    </div>
                  )}

                  {extState === "thanh_toan" && (
                    <div className="space-y-4">
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600"/>
                        <p className="font-bold text-emerald-800 text-sm">Gia sư đã phê duyệt!</p>
                      </div>
                      <div className="flex justify-center">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                          {PAYMENT_CONFIG.qrCodeUrl
                            ? <img src={PAYMENT_CONFIG.qrCodeUrl} alt="QR" className="w-44 h-44 rounded-xl"/>
                            : <div className="w-44 h-44 bg-slate-100 rounded-xl flex items-center justify-center"><p className="text-slate-400 text-sm">QR Code</p></div>}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Số buổi gia hạn</span><span className="font-bold">+{extSessions} buổi</span></div>
                        <div className="flex justify-between pt-2 border-t border-slate-200"><span className="text-slate-500 font-bold">Số tiền</span><span className="font-black text-violet-600 text-lg">{fmtCurrency(extPrice)}</span></div>
                      </div>
                      <button onClick={confirmExtendPay} disabled={extSubmitting}
                        className="w-full py-3 rounded-xl font-black text-white bg-violet-600 hover:bg-violet-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                        {extSubmitting ? <Loader2 size={16} className="animate-spin"/> : <CreditCard size={16}/>}
                        {extSubmitting ? "Đang xử lý..." : "Xác nhận đã chuyển khoản"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}