"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { hocVienService, type DangKyHocResponse } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";
import {
  BookOpen, Clock, X, CreditCard, Loader2, GraduationCap,
  CalendarDays, ChevronRight, Star, AlertTriangle, CheckCircle2,
  PlayCircle, RefreshCcw, TrendingUp, XCircle, Hourglass, Home
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

function GiaHanBadge({ trangThai, soBuoi, onThanhToan }: {
  trangThai: string;
  soBuoi?: number;
  onThanhToan?: () => void;
}) {
  if (trangThai === "Chờ duyệt") return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{background:"#FAEEDA",borderColor:"#FAC775"}}>
      <Hourglass size={13} style={{color:"#854F0B",flexShrink:0}}/>
      <span className="text-xs font-medium" style={{color:"#633806"}}>Chờ gia sư duyệt gia hạn {soBuoi ? `(+${soBuoi} buổi)` : ""}</span>
    </div>
  );
  if (trangThai === "Từ chối") return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{background:"#FCEBEB",borderColor:"#F7C1C1"}}>
      <XCircle size={13} style={{color:"#A32D2D",flexShrink:0}}/>
      <span className="text-xs font-medium" style={{color:"#791F1F"}}>Gia sư đã từ chối gia hạn</span>
    </div>
  );
  if (trangThai === "Chờ thanh toán" || trangThai === "Đã duyệt") return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{background:"#E6F1FB",borderColor:"#B5D4F4"}}>
      <CheckCircle2 size={13} style={{color:"#185FA5",flexShrink:0}}/>
      <span className="text-xs font-medium flex-1" style={{color:"#0C447C"}}>Gia sư đã duyệt! Chờ thanh toán {soBuoi ? `(+${soBuoi} buổi)` : ""}</span>
      {onThanhToan && (
        <button onClick={onThanhToan}
          className="px-2.5 py-1 text-white text-xs font-medium rounded-md transition-colors flex-shrink-0"
          style={{background:"#185FA5"}}
          onMouseOver={e=>(e.currentTarget.style.background="#0C447C")}
          onMouseOut={e=>(e.currentTarget.style.background="#185FA5")}>
          Thanh toán
        </button>
      )}
    </div>
  );
  if (trangThai === "Đã hoàn thành") return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{background:"#EAF3DE",borderColor:"#C0DD97"}}>
      <CheckCircle2 size={13} style={{color:"#3B6D11",flexShrink:0}}/>
      <span className="text-xs font-medium" style={{color:"#27500A"}}>Đã gia hạn thành công {soBuoi ? `(+${soBuoi} buổi)` : ""}</span>
    </div>
  );
  if (trangThai === "Đã hủy") return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
      <XCircle size={13} className="text-slate-400 flex-shrink-0"/>
      <span className="text-xs font-medium text-slate-500">Đã hủy gia hạn — có thể gia hạn lại</span>
    </div>
  );
  return null;
}

const TAB_COLORS = {
  dang_hoc:   { bg:"#EAF3DE", text:"#3B6D11", dot:"#639922", bar:"#639922", active:"#3B6D11" },
  chua_bt:    { bg:"#FAEEDA", text:"#854F0B", dot:"#BA7517", bar:"#BA7517", active:"#854F0B" },
  hoan_thanh: { bg:"#EEEDFE", text:"#3C3489", dot:"#534AB7", bar:"#534AB7", active:"#3C3489" },
};

export default function BookingHistoryPage() {
  const router = useRouter();
  const { isLoggedIn, idNguoiDung } = useAuthStore();

  const [loading, setLoading]   = useState(true);
  const [bookings, setBookings] = useState<DangKyHocResponse[]>([]);
  const [tab, setTab]           = useState<"dang_hoc"|"chua_bt"|"hoan_thanh">("dang_hoc");

  const [payingBooking,  setPayingBooking]  = useState<DangKyHocResponse|null>(null);
  const [paySubmitting,  setPaySubmitting]  = useState(false);
  const [payError,       setPayError]       = useState("");
  const [paySuccess,     setPaySuccess]     = useState("");

  const [extBook,       setExtBook]       = useState<DangKyHocResponse|null>(null);
  const [extLoading,    setExtLoading]    = useState(false);
  const [extSubmitting, setExtSubmitting] = useState(false);
  const [extError,      setExtError]      = useState("");
  const [extSuccess,    setExtSuccess]    = useState("");
  const [extState,      setExtState]      = useState<"form"|"cho_duyet"|"thanh_toan">("form");
  const [extType,       setExtType]       = useState<"Toàn bộ"|"Tùy chọn">("Toàn bộ");
  const [extSessions,   setExtSessions]   = useState(1);
  const [extId,         setExtId]         = useState("");

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

  const chuaThanhToan = bookings.filter(b =>
    b.trangThaiThanhToan === false && !b.trangThaiGiaHan
  );
  const dangHocChoGiaHan = bookings.filter(b =>
    b.trangThaiThanhToan === false &&
    (b.trangThaiGiaHan === "Chờ thanh toán" || b.trangThaiGiaHan === "Đã duyệt")
  );
  const dangHoc = [
    ...bookings.filter(b => b.trangThaiThanhToan !== false && getStatus(b) === "Đang học"),
    ...dangHocChoGiaHan,
  ];
  const chuaBatDau  = bookings.filter(b => b.trangThaiThanhToan !== false && getStatus(b) === "Chưa bắt đầu");
  const daHoanThanh = bookings.filter(b => b.trangThaiThanhToan !== false && getStatus(b) === "Đã hoàn thành");

  const tabConfig = [
    { key:"dang_hoc"   as const, label:"Đang học",     count:dangHoc.length,    icon:PlayCircle   },
    { key:"chua_bt"    as const, label:"Chưa bắt đầu", count:chuaBatDau.length, icon:Clock        },
    { key:"hoan_thanh" as const, label:"Hoàn thành",   count:daHoanThanh.length,icon:CheckCircle2 },
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
      await fetchData();
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
      await fetchData();
      setTimeout(() => setPayExtBook(null), 2000);
    } catch (e: any) { setPayExtError(e?.message || "Lỗi!"); }
    finally { setPayExtSubmit(false); }
  };

  const huyGiaHanFromBadge = async () => {
    if (!payExtBook?.idYeuCauGiaHan) return;
    try {
      setPayExtSubmit(true); setPayExtError("");
      await hocVienService.huyYeuCauGiaHan(payExtBook.idYeuCauGiaHan);
      await fetchData();
      setPayExtBook(null);
    } catch (e: any) { setPayExtError(e?.message || "Lỗi hủy!"); }
    finally { setPayExtSubmit(false); }
  };

  const extDonGia = extBook ? extBook.khoaHoc.soTienHoc / extBook.khoaHoc.soBuoiHoc : 0;
  const extPrice  = extType === "Toàn bộ" ? (extBook?.khoaHoc.soTienHoc ?? 0) : extSessions * extDonGia;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin" size={28} style={{color:"#1D9E75"}}/>
        <p className="text-slate-400 text-sm">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ══════════════════════════════════
          HERO BANNER — khớp SearchPage
      ══════════════════════════════════ */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 w-full pt-5 pb-10 relative overflow-hidden">
        {/* Hiệu ứng orb nền */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm font-medium text-blue-200/70 mb-4">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Home size={14} /> Trang chủ
            </Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <Link href="/hoc-vien" className="hover:text-white transition-colors">
              Học viên
            </Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <span className="text-white font-semibold">Lịch sử đăng ký</span>
          </nav>

          {/* Tiêu đề + mô tả */}
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
            Hồ sơ học tập của bạn
          </h1>
          <p className="text-blue-200 text-sm font-medium max-w-xl">
            Theo dõi tiến độ, quản lý lịch học và gia hạn các khóa học đang tham gia.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════
          NỘI DUNG CHÍNH
      ══════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-6 items-start">

          {/* ── CỘT TRÁI ── */}
          <div className="space-y-4 lg:sticky lg:top-6">

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"#E1F5EE"}}>
                  <GraduationCap size={20} style={{color:"#0F6E56"}}/>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-slate-900">Tổng quan</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Quản lý khóa học của bạn</p>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { label:"Đang học",      val:dangHoc.length,    cfg:TAB_COLORS.dang_hoc   },
                  { label:"Chưa bắt đầu", val:chuaBatDau.length, cfg:TAB_COLORS.chua_bt    },
                  { label:"Hoàn thành",   val:daHoanThanh.length,cfg:TAB_COLORS.hoan_thanh },
                ].map((s,i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{background:s.cfg.bg}}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{background:s.cfg.dot}}/>
                      <span className="text-sm font-medium" style={{color:s.cfg.text}}>{s.label}</span>
                    </div>
                    <span className="text-xl font-medium" style={{color:s.cfg.text}}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chờ thanh toán lần đầu */}
            {chuaThanhToan.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden" style={{border:"1px solid #FAC775"}}>
                <div className="px-4 py-3 flex items-center gap-2" style={{background:"#FAEEDA",borderBottom:"0.5px solid #FAC775"}}>
                  <AlertTriangle size={14} style={{color:"#854F0B"}}/>
                  <span className="text-sm font-medium" style={{color:"#633806"}}>Chờ thanh toán ({chuaThanhToan.length})</span>
                </div>
                {chuaThanhToan.map(b => (
                  <div key={b.idDangKy} className="p-4 border-b last:border-0" style={{borderColor:"#FEF3C7"}}>
                    <p className="text-sm font-medium text-slate-800 truncate mb-1">{b.khoaHoc.tenKhoaHoc}</p>
                    <p className="text-xs text-slate-400 mb-3">{b.khoaHoc.tenGiaSu}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{color:"#854F0B"}}>{fmtCurrency(b.khoaHoc.soTienHoc)}</span>
                      <button onClick={() => { setPayingBooking(b); setPayError(""); setPaySuccess(""); }}
                        className="px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors"
                        style={{background:"#BA7517"}}
                        onMouseOver={e=>(e.currentTarget.style.background="#854F0B")}
                        onMouseOut={e=>(e.currentTarget.style.background="#BA7517")}>
                        Thanh toán
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <Link href="/search">
              <div className="rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-colors group"
                style={{background:"#1D9E75"}}
                onMouseOver={e=>(e.currentTarget.style.background="#0F6E56")}
                onMouseOut={e=>(e.currentTarget.style.background="#1D9E75")}>
                <div>
                  <p className="text-sm font-medium text-white">Tìm khóa học mới</p>
                  <p className="text-xs mt-0.5" style={{color:"#9FE1CB"}}>Khám phá gia sư phù hợp</p>
                </div>
                <ChevronRight size={18} style={{color:"#9FE1CB"}} className="group-hover:translate-x-1 transition-transform"/>
              </div>
            </Link>
          </div>

          {/* ── CỘT PHẢI ── */}
          <div>
            {/* Tabs */}
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-4">
              {tabConfig.map(t => {
                const Icon = t.icon;
                const active = tab === t.key;
                const c = TAB_COLORS[t.key];
                return (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={active ? {background:c.bg, color:c.text} : {color:"#94a3b8"}}>
                    <Icon size={14}/>
                    <span className="hidden sm:inline">{t.label}</span>
                    <span className="text-xs opacity-70">({t.count})</span>
                  </button>
                );
              })}
            </div>

            {/* List */}
            {displayed.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
                <BookOpen size={32} className="text-slate-200 mx-auto mb-3"/>
                <p className="text-slate-300 text-base font-medium">Không có khóa học nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayed.map(b => {
                  const status = getStatus(b);
                  const done  = b.chiTietLichHoc.filter((c:any) => c.tinhTrang === "Đã hoàn thành" || c.tinhTrang === "Đã nghỉ").length;
                  const total = b.khoaHoc.soBuoiHoc;
                  const pct   = total > 0 ? Math.round((done/total)*100) : 0;

                  const isChoThanhToanGiaHan =
                    b.trangThaiThanhToan === false &&
                    (b.trangThaiGiaHan === "Chờ thanh toán" || b.trangThaiGiaHan === "Đã duyệt");

                  const hasActiveGiaHan = b.trangThaiGiaHan &&
                    ["Chờ duyệt","Đã duyệt","Chờ thanh toán","Đã hoàn thành"].includes(b.trangThaiGiaHan);
                  const canExtend = status === "Đang học" && !hasActiveGiaHan && !isChoThanhToanGiaHan;

                  const cfgKey = status === "Đang học" ? "dang_hoc"
                    : status === "Chưa bắt đầu" ? "chua_bt" : "hoan_thanh";
                  const c = TAB_COLORS[cfgKey];

                  return (
                    <div key={b.idDangKy}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start gap-3">
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden border border-slate-100">
                            {b.khoaHoc.anhMinhHoa ? (
                              <img src={b.khoaHoc.anhMinhHoa} alt="" className="w-full h-full object-cover"/>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{background:"#E1F5EE"}}>
                                <BookOpen size={18} style={{color:"#0F6E56"}}/>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{background:c.bg, color:c.text}}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{background:c.dot}}/>
                                {status}
                              </span>
                              <span className="text-xs text-slate-300">#{b.idDangKy}</span>
                            </div>
                            <h3 className="text-sm font-medium text-slate-900 truncate leading-snug">{b.khoaHoc.tenKhoaHoc}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Gia sư: <span className="text-slate-600">{b.khoaHoc.tenGiaSu}</span>
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-medium text-slate-900">{fmtCurrency(b.khoaHoc.soTienHoc)}</p>
                            <p className="text-xs text-slate-400">{total} buổi</p>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-400 flex items-center gap-1">
                              <TrendingUp size={11}/> Tiến độ
                            </span>
                            <span className="font-medium" style={{color:c.text}}>{done}/{total} buổi · {pct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:c.bar}}/>
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

                        {/* Badge gia hạn */}
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
                          <button className="w-full py-2 rounded-xl text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center gap-1 transition-all">
                            Xem lịch học <ChevronRight size={12}/>
                          </button>
                        </Link>

                        {canExtend && (
                          <button onClick={() => openExtend(b)}
                            className="flex-1 py-2 rounded-xl text-xs font-medium text-white transition-all"
                            style={{background:"#1D9E75"}}
                            onMouseOver={e=>(e.currentTarget.style.background="#0F6E56")}
                            onMouseOut={e=>(e.currentTarget.style.background="#1D9E75")}>
                            + Gia hạn
                          </button>
                        )}

                        {status === "Đang học" && b.trangThaiGiaHan === "Chờ duyệt" && (
                          <button disabled className="flex-1 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-400 cursor-not-allowed">
                            Đang chờ duyệt...
                          </button>
                        )}

                        {status === "Đã hoàn thành" && (
                          <Link href={`/hoc-vien/danh-gia/${b.idDangKy}`} className="flex-1">
                            <button className="w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all"
                              style={{background:"#FAEEDA",border:"0.5px solid #FAC775",color:"#854F0B"}}
                              onMouseOver={e=>(e.currentTarget.style.background="#FAC775")}
                              onMouseOut={e=>(e.currentTarget.style.background="#FAEEDA")}>
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
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-medium text-slate-900">Thanh toán khóa học</h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{payingBooking.khoaHoc.tenKhoaHoc}</p>
              </div>
              <button onClick={() => setPayingBooking(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                <X size={16}/>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {payError   && <div className="p-3 rounded-xl text-sm flex items-center gap-2" style={{background:"#FCEBEB",color:"#A32D2D"}}><AlertTriangle size={14}/>{payError}</div>}
              {paySuccess && <div className="p-3 rounded-xl text-sm flex items-center gap-2" style={{background:"#EAF3DE",color:"#3B6D11"}}><CheckCircle2 size={14}/>{paySuccess}</div>}
              {!paySuccess && <>
                <div className="flex justify-center">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    {PAYMENT_CONFIG.qrCodeUrl
                      ? <img src={PAYMENT_CONFIG.qrCodeUrl} alt="QR" className="w-44 h-44 rounded-xl"/>
                      : <div className="w-44 h-44 bg-slate-100 rounded-xl flex items-center justify-center"><p className="text-slate-400 text-sm">QR Code</p></div>}
                  </div>
                </div>
                <div className="rounded-xl p-4 space-y-2 border border-slate-100 text-sm" style={{background:"#F8FAFC"}}>
                  <div className="flex justify-between"><span className="text-slate-500">Số buổi</span><span className="font-medium">{payingBooking.khoaHoc.soBuoiHoc} buổi</span></div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Tổng tiền</span>
                    <span className="font-medium text-base" style={{color:"#185FA5"}}>{fmtCurrency(payingBooking.khoaHoc.soTienHoc)}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 text-center">Nội dung: <strong>Dat lop - {payingBooking.idDangKy}</strong></p>
                <button onClick={handleFirstPay} disabled={paySubmitting}
                  className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{background:"#185FA5"}}
                  onMouseOver={e=>!paySubmitting&&(e.currentTarget.style.background="#0C447C")}
                  onMouseOut={e=>(e.currentTarget.style.background="#185FA5")}>
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
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-medium text-slate-900">Thanh toán gia hạn</h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{payExtBook.khoaHoc.tenKhoaHoc}</p>
              </div>
              <button onClick={() => setPayExtBook(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                <X size={16}/>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {payExtError   && <div className="p-3 rounded-xl text-sm flex items-center gap-2" style={{background:"#FCEBEB",color:"#A32D2D"}}><AlertTriangle size={14}/>{payExtError}</div>}
              {payExtSuccess && <div className="p-3 rounded-xl text-sm flex items-center gap-2" style={{background:"#EAF3DE",color:"#3B6D11"}}><CheckCircle2 size={14}/>{payExtSuccess}</div>}
              {!payExtSuccess && <>
                <div className="p-3 rounded-xl flex items-center gap-2" style={{background:"#EAF3DE",border:"0.5px solid #C0DD97"}}>
                  <CheckCircle2 size={14} style={{color:"#3B6D11"}}/>
                  <p className="text-sm font-medium" style={{color:"#27500A"}}>Gia sư đã phê duyệt gia hạn!</p>
                </div>
                <div className="flex justify-center">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    {PAYMENT_CONFIG.qrCodeUrl
                      ? <img src={PAYMENT_CONFIG.qrCodeUrl} alt="QR" className="w-44 h-44 rounded-xl"/>
                      : <div className="w-44 h-44 bg-slate-100 rounded-xl flex items-center justify-center"><p className="text-slate-400 text-sm">QR Code</p></div>}
                  </div>
                </div>
                <div className="rounded-xl p-4 space-y-2 border border-slate-100 text-sm" style={{background:"#F8FAFC"}}>
                  <div className="flex justify-between"><span className="text-slate-500">Số buổi gia hạn</span><span className="font-medium">+{payExtBook.soBuoiGiaHan} buổi</span></div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Số tiền</span>
                    <span className="font-medium text-base" style={{color:"#185FA5"}}>
                      {fmtCurrency((payExtBook.khoaHoc.soTienHoc / payExtBook.khoaHoc.soBuoiHoc) * (payExtBook.soBuoiGiaHan || 0))}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={huyGiaHanFromBadge} disabled={payExtSubmit}
                    className="flex-1 py-3 rounded-xl text-sm font-medium border transition-all disabled:opacity-50"
                    style={{borderColor:"#F7C1C1",color:"#A32D2D",background:"#FCEBEB"}}
                    onMouseOver={e=>!payExtSubmit&&(e.currentTarget.style.background="#F7C1C1")}
                    onMouseOut={e=>(e.currentTarget.style.background="#FCEBEB")}>
                    Không gia hạn nữa
                  </button>
                  <button onClick={confirmPayExtFromBadge} disabled={payExtSubmit}
                    className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    style={{background:"#185FA5"}}
                    onMouseOver={e=>!payExtSubmit&&(e.currentTarget.style.background="#0C447C")}
                    onMouseOut={e=>(e.currentTarget.style.background="#185FA5")}>
                    {payExtSubmit ? <Loader2 size={15} className="animate-spin"/> : <CreditCard size={15}/>}
                    {payExtSubmit ? "Đang xử lý..." : "Đã chuyển khoản"}
                  </button>
                </div>
              </>}
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL GIA HẠN ══ */}
      {extBook && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-medium text-slate-900 flex items-center gap-2">
                  <RefreshCcw size={16} style={{color:"#1D9E75"}}/> Gia hạn khóa học
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[260px]">{extBook.khoaHoc.tenKhoaHoc}</p>
              </div>
              <button onClick={() => setExtBook(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                <X size={16}/>
              </button>
            </div>
            <div className="p-6">
              {extLoading ? (
                <div className="flex flex-col items-center py-10">
                  <Loader2 className="animate-spin mb-3" size={24} style={{color:"#1D9E75"}}/>
                  <p className="text-slate-400 text-sm">Đang kiểm tra...</p>
                </div>
              ) : (
                <>
                  {extError   && <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2" style={{background:"#FCEBEB",color:"#A32D2D"}}><AlertTriangle size={14}/>{extError}</div>}
                  {extSuccess && <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2" style={{background:"#EAF3DE",color:"#3B6D11"}}><CheckCircle2 size={14}/>{extSuccess}</div>}

                  {extState === "form" && (
                    <form onSubmit={submitExtend} className="space-y-4">
                      <p className="text-sm text-slate-600">Chọn hình thức gia hạn:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {(["Toàn bộ","Tùy chọn"] as const).map(type => (
                          <label key={type} className="cursor-pointer rounded-xl p-4 border-2 transition-all block"
                            style={extType===type
                              ? {borderColor:"#1D9E75", background:"#EAF3DE"}
                              : {borderColor:"#e2e8f0"}}>
                            <div className="flex items-center gap-2 mb-3">
                              <input type="radio" checked={extType===type}
                                onChange={() => { setExtType(type); setExtSessions(type==="Toàn bộ" ? extBook.khoaHoc.soBuoiHoc : 1); }}
                                className="w-4 h-4" style={{accentColor:"#1D9E75"}}/>
                              <span className="text-sm font-medium text-slate-900">{type}</span>
                            </div>
                            {type==="Toàn bộ" ? (
                              <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <p className="text-xs text-slate-400">+{extBook.khoaHoc.soBuoiHoc} buổi</p>
                                <p className="font-medium text-sm" style={{color:"#185FA5"}}>{fmtCurrency(extBook.khoaHoc.soTienHoc)}</p>
                              </div>
                            ) : extType==="Tùy chọn" ? (
                              <div className="space-y-2">
                                <input type="number" min="1" value={extSessions}
                                  onChange={e => setExtSessions(parseInt(e.target.value)||1)}
                                  onClick={e => e.stopPropagation()}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                                  style={{color:"#1D9E75"}}/>
                                <div className="bg-white rounded-lg p-3 border border-slate-100">
                                  <p className="text-xs text-slate-400">{fmtCurrency(extDonGia)}/buổi</p>
                                  <p className="font-medium text-sm" style={{color:"#185FA5"}}>{fmtCurrency(extSessions*extDonGia)}</p>
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
                        className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        style={{background:"#1D9E75"}}
                        onMouseOver={e=>!extSubmitting&&(e.currentTarget.style.background="#0F6E56")}
                        onMouseOut={e=>(e.currentTarget.style.background="#1D9E75")}>
                        {extSubmitting ? <Loader2 size={15} className="animate-spin"/> : null}
                        {extSubmitting ? "Đang gửi..." : "Gửi yêu cầu gia hạn"}
                      </button>
                    </form>
                  )}

                  {extState === "cho_duyet" && (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{background:"#FAEEDA"}}>
                        <Hourglass size={24} style={{color:"#BA7517"}}/>
                      </div>
                      <h3 className="font-medium text-slate-900 text-base mb-2">Chờ gia sư xác nhận</h3>
                      <p className="text-slate-400 text-sm max-w-xs mx-auto">Yêu cầu đã gửi. Bạn sẽ thấy thông báo ngay trên thẻ khóa học khi gia sư phê duyệt.</p>
                      <button onClick={() => setExtBook(null)}
                        className="mt-5 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors text-sm">
                        Đóng
                      </button>
                    </div>
                  )}

                  {extState === "thanh_toan" && (
                    <div className="space-y-4">
                      <div className="p-3 rounded-xl flex items-center gap-2" style={{background:"#EAF3DE",border:"0.5px solid #C0DD97"}}>
                        <CheckCircle2 size={14} style={{color:"#3B6D11"}}/>
                        <p className="font-medium text-sm" style={{color:"#27500A"}}>Gia sư đã phê duyệt!</p>
                      </div>
                      <div className="flex justify-center">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                          {PAYMENT_CONFIG.qrCodeUrl
                            ? <img src={PAYMENT_CONFIG.qrCodeUrl} alt="QR" className="w-44 h-44 rounded-xl"/>
                            : <div className="w-44 h-44 bg-slate-100 rounded-xl flex items-center justify-center"><p className="text-slate-400 text-sm">QR Code</p></div>}
                        </div>
                      </div>
                      <div className="rounded-xl p-4 space-y-2 border border-slate-100 text-sm" style={{background:"#F8FAFC"}}>
                        <div className="flex justify-between"><span className="text-slate-500">Số buổi gia hạn</span><span className="font-medium">+{extSessions} buổi</span></div>
                        <div className="flex justify-between pt-2 border-t border-slate-100">
                          <span className="text-slate-500">Số tiền</span>
                          <span className="font-medium text-base" style={{color:"#185FA5"}}>{fmtCurrency(extPrice)}</span>
                        </div>
                      </div>
                      <button onClick={confirmExtendPay} disabled={extSubmitting}
                        className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        style={{background:"#185FA5"}}
                        onMouseOver={e=>!extSubmitting&&(e.currentTarget.style.background="#0C447C")}
                        onMouseOut={e=>(e.currentTarget.style.background="#185FA5")}>
                        {extSubmitting ? <Loader2 size={15} className="animate-spin"/> : <CreditCard size={15}/>}
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