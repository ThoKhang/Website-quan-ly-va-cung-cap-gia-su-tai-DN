"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  hocVienService,
  type LichRanhResponse,
  type HocVienListItem,
} from "@/services/hoc-vien.service";
import type { KhoaHocResponseDTO } from "@/types/khoa-hoc.type";
import { useAuthStore } from "@/store/auth.store";
import { PAYMENT_CONFIG } from "@/config/payment.config";
import {
  Home, ChevronRight, Loader2, BookOpen, Star, CalendarDays,
  Clock, Users, CreditCard, CheckCircle2, AlertCircle, X,
  CheckSquare, Square, User, GraduationCap, Banknote, ShieldCheck,
  FileText, Scale, QrCode
} from "lucide-react";

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn, idNguoiDung } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [course, setCourse] = useState<KhoaHocResponseDTO | null>(null);
  const [schedules, setSchedules] = useState<LichRanhResponse[]>([]);
  const [hocVienList, setHocVienList] = useState<HocVienListItem[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [ngayBatDau, setNgayBatDau] = useState("");
  const [hocVienId, setHocVienId] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<any>(null);

  // Inline field errors
  const [fieldErrors, setFieldErrors] = useState<{
    hocVien?: string;
    lich?: string;
    ngay?: string;
    terms?: string;
  }>({});

  const idKhoaHoc = params.id as string;

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    fetchData();
  }, [isLoggedIn, router, idKhoaHoc]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const courseData = await hocVienService.getCourseDetail(idKhoaHoc);
      setCourse(courseData);

      if (courseData.idGiaSu) {
        const schedulesData = await hocVienService.getTutorSchedule(courseData.idGiaSu);
        const seenIds = new Set<string>();
        const uniqueSchedules = schedulesData.filter((s) => {
          if (seenIds.has(s.idLichDay)) return false;
          seenIds.add(s.idLichDay);
          return true;
        });
        setSchedules(uniqueSchedules);
      } else {
        setSchedules([]);
      }

      const hocVienData = await hocVienService.getHocVienList();
      setHocVienList(hocVienData);
      if (hocVienData.length > 0) setHocVienId(hocVienData[0].idHocVien);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleToggle = (idLichDay: string) => {
    setSelectedSchedules((prev) =>
      prev.includes(idLichDay) ? prev.filter((id) => id !== idLichDay) : [...prev, idLichDay]
    );
    if (fieldErrors.lich) setFieldErrors((e) => ({ ...e, lich: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Inline validation
    const errs: typeof fieldErrors = {};
    if (!hocVienId) errs.hocVien = "Vui lòng chọn học viên";
    if (selectedSchedules.length === 0) errs.lich = "Vui lòng chọn ít nhất 1 buổi học";
    if (!ngayBatDau) errs.ngay = "Vui lòng chọn ngày bắt đầu học";
    if (!acceptedTerms) errs.terms = "Vui lòng chấp nhận các điều khoản để tiếp tục";

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      const bookingData = {
        idPhuHuynh: idNguoiDung || "",
        idHocVien: hocVienId,
        idKhoaHoc,
        danhSachIdLichDay: selectedSchedules,
        danhSachThoiGianHoc: selectedSchedules.map((idLichDay) => {
          const s = schedules.find((sc) => sc.idLichDay === idLichDay)!;
          return {
            idLichDay,
            gioBatDau: s.tietHoc.gioBatDau,
            gioKetThuc: s.tietHoc.gioKetThuc,
          };
        }),
        phuongThucThanhToan: "Chuyển khoản",
        ngayBatDauHoc: ngayBatDau,
      };
      setPendingBookingData(bookingData);
      setShowPaymentModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setSubmitting(true);
      setError("");
      const bookingResult: any = await hocVienService.bookCourse(pendingBookingData);
      const finalIdDangKy = bookingResult.idDangKy;
      if (!finalIdDangKy) throw new Error("Backend chưa trả về idDangKy.");
      setSuccess("Đặt lớp và thanh toán thành công!");
      setShowPaymentModal(false);
      setTimeout(() => router.push("/hoc-vien/lich-su"), 2000);
    } catch (err: any) {
      setError(err?.message || err.response?.data?.message || "Có lỗi xảy ra khi xác nhận thanh toán.");
      setSubmitting(false);
    }
  };

  const getSelectedHocVien = () => hocVienList.find((hv) => hv.idHocVien === hocVienId);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  const formatTime = (t: string) => t.substring(0, 5);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-500" size={36} />
        <p className="text-sm text-slate-500">Đang tải thông tin khóa học…</p>
      </div>
    </div>
  );

  /* ── Not found ── */
  if (!course) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-lg font-semibold text-slate-700 mb-4">Không tìm thấy khóa học</p>
        <Link href="/search">
          <button className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors">
            Quay lại tìm kiếm
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ══ HERO BANNER ══ */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 w-full pt-5 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <nav className="flex items-center text-sm font-medium text-blue-200/70 mb-4">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Home size={14} /> Trang chủ
            </Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <Link href="/search" className="hover:text-white transition-colors">Tìm kiếm</Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <span className="text-white font-semibold">Đặt lớp</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">Đặt lớp học</h1>
          <p className="text-blue-200 text-sm font-medium max-w-xl">
            Chọn lịch học phù hợp và hoàn tất đăng ký để bắt đầu hành trình học tập.
          </p>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700">
            <CheckCircle2 size={18} /> <span className="text-sm font-medium">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── FORM ── */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* 1. Chọn học viên */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <User size={14} className="text-blue-600" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                    Chọn học viên
                  </h2>
                </div>

                {hocVienList.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">
                      Bạn chưa có học viên nào.{" "}
                      <Link href="/hoc-vien/ho-so" className="font-semibold underline">
                        Tạo hồ sơ học viên
                      </Link>
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      value={hocVienId}
                      onChange={(e) => { setHocVienId(e.target.value); setFieldErrors((er) => ({ ...er, hocVien: undefined })); }}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${fieldErrors.hocVien ? "border-red-300" : "border-slate-200"}`}
                    >
                      <option value="">-- Chọn học viên --</option>
                      {hocVienList.map((hv) => (
                        <option key={hv.idHocVien} value={hv.idHocVien}>
                          {hv.tenHocVien} (ID: {hv.idHocVien})
                        </option>
                      ))}
                    </select>
                    {fieldErrors.hocVien && (
                      <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {fieldErrors.hocVien}
                      </p>
                    )}

                    {getSelectedHocVien() && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 flex-shrink-0">
                          {getSelectedHocVien()!.tenHocVien.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{getSelectedHocVien()!.tenHocVien}</p>
                          <p className="text-xs text-slate-500">
                            Ngày sinh: {new Date(getSelectedHocVien()!.ngaySinh || "").toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <CheckCircle2 size={16} className="ml-auto text-blue-500 flex-shrink-0" />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 2. Chọn lịch học */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <CalendarDays size={14} className="text-indigo-600" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                    Chọn lịch học
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mb-4 ml-9">Chọn các buổi học phù hợp từ lịch rảnh của gia sư.</p>

                {schedules.length === 0 ? (
                  <div className="text-center py-10">
                    <CalendarDays size={28} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-sm text-slate-400">Gia sư chưa đăng ký lịch rảnh.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {schedules.map((schedule) => {
                      const selected = selectedSchedules.includes(schedule.idLichDay);
                      const avail = schedule.tinhTrang;
                      return (
                        <label
                          key={schedule.idLichDay}
                          className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                            !avail
                              ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                              : selected
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => avail && handleScheduleToggle(schedule.idLichDay)}
                            disabled={!avail}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                            selected ? "bg-blue-600 border-blue-600" : "border-slate-300"
                          }`}>
                            {selected && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${selected ? "text-blue-800" : "text-slate-800"}`}>
                              {schedule.tietHoc.thu}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <Clock size={10} />
                              {formatTime(schedule.tietHoc.gioBatDau)} – {formatTime(schedule.tietHoc.gioKetThuc)}
                              &nbsp;·&nbsp;{schedule.tietHoc.soTiet} tiết ({schedule.tietHoc.soTiet * 45} phút)
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${
                            avail ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            {avail ? "✓ Rảnh" : "✗ Đã đặt"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Đã chọn: <span className="font-semibold text-slate-700">{selectedSchedules.length} buổi</span>
                  </p>
                  {fieldErrors.lich && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} /> {fieldErrors.lich}
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Ngày bắt đầu */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CalendarDays size={14} className="text-emerald-600" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                    Ngày bắt đầu học
                  </h2>
                </div>
                <input
                  type="date"
                  value={ngayBatDau}
                  onChange={(e) => { setNgayBatDau(e.target.value); setFieldErrors((er) => ({ ...er, ngay: undefined })); }}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all ${fieldErrors.ngay ? "border-red-300" : "border-slate-200"}`}
                />
                {fieldErrors.ngay ? (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.ngay}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">Chọn ngày bắt đầu từ hôm nay trở đi.</p>
                )}
              </div>

              {/* 4. Phương thức thanh toán */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Banknote size={14} className="text-amber-600" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                    Phương thức thanh toán
                  </h2>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <CreditCard size={18} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Chuyển khoản ngân hàng</p>
                    <p className="text-xs text-slate-500 mt-0.5">Khóa học được kích hoạt sau khi hoàn tất thanh toán trên hệ thống.</p>
                  </div>
                  <CheckCircle2 size={16} className="ml-auto text-blue-500 flex-shrink-0" />
                </div>
              </div>

              {/* 5. Điều khoản */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    <ShieldCheck size={14} className="text-slate-600" />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                    Điều khoản & Chính sách
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-slate-600 mb-5">
                  {[
                    {
                      icon: <FileText size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />,
                      title: "Chính sách đặt khóa học và thanh toán",
                      items: [
                        "Khóa học chỉ được xác nhận khi hoàn tất quy trình thanh toán",
                        "Trạng thái đăng ký sẽ được cập nhật trong hồ sơ tài khoản",
                        "Mức học phí hiển thị là mức phí cuối cùng, không có phụ phí ẩn",
                      ],
                    },
                    {
                      icon: <Users size={14} className="text-indigo-500 flex-shrink-0 mt-0.5" />,
                      title: "Quyền và trách nhiệm của phụ huynh/học viên",
                      items: [
                        "Học viên cần tham gia đúng giờ, tôn trọng gia sư",
                        "Hệ thống không cam kết tuyệt đối về điểm số",
                        "Hành vi vi phạm đạo đức, pháp luật sẽ bị khóa tài khoản vĩnh viễn",
                      ],
                    },
                    {
                      icon: <Scale size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />,
                      title: "Giải quyết tranh chấp",
                      items: [
                        "Hệ thống là nền tảng kết nối và trung gian giải quyết khiếu nại",
                        "Tranh chấp được xử lý dựa trên dữ liệu lịch sử trên website",
                        "Quyết định của Ban quản trị hệ thống là quyết định cao nhất",
                      ],
                    },
                  ].map((section, i) => (
                    <div key={i} className="flex gap-3">
                      {section.icon}
                      <div>
                        <p className="font-semibold text-slate-700 mb-1">{section.title}</p>
                        <ul className="space-y-0.5">
                          {section.items.map((item, j) => (
                            <li key={j} className="text-xs text-slate-500 flex gap-1.5">
                              <span className="text-slate-300 flex-shrink-0">·</span>{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  acceptedTerms ? "bg-emerald-50 border-emerald-200" : fieldErrors.terms ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}>
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => { setAcceptedTerms(e.target.checked); setFieldErrors((er) => ({ ...er, terms: undefined })); }}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                    acceptedTerms ? "bg-emerald-600 border-emerald-600" : fieldErrors.terms ? "border-red-400" : "border-slate-300"
                  }`}>
                    {acceptedTerms && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    Tôi đã đọc và đồng ý với các điều khoản và chính sách trên
                  </p>
                </label>
                {fieldErrors.terms && (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {fieldErrors.terms}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || hocVienList.length === 0}
                className="w-full py-4 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <BookOpen size={18} />}
                {submitting ? "Đang xử lý…" : "Đặt lớp ngay"}
              </button>
            </form>
          </div>

          {/* ── SIDEBAR: Thông tin khóa học ── */}
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <GraduationCap size={16} className="text-blue-600" />
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Thông tin khóa học</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Tên khóa học", value: course.tenKhoaHoc },
                    { label: "Gia sư", value: course.tenGiaSu },
                    { label: "Môn học", value: course.tenMonHoc },
                    { label: "Cấp lớp", value: course.tenLop },
                    { label: "Số buổi học", value: `${course.soBuoiHoc} buổi` },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-start gap-2">
                      <span className="text-xs text-slate-400 flex-shrink-0">{row.label}</span>
                      <span className="text-xs font-semibold text-slate-800 text-right">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Giá / buổi</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {formatCurrency(Number(course.soTienHoc) / (course.soBuoiHoc || 1))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Tổng học phí</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(Number(course.soTienHoc))}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-700">{course.saoTrungBinh || 0}</span>
                  <span className="text-xs text-slate-400">/ 5 sao</span>
                </div>
              </div>
            </div>

            {/* Tóm tắt lựa chọn */}
            {(selectedSchedules.length > 0 || ngayBatDau) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">Lựa chọn của bạn</p>
                <div className="space-y-2">
                  {selectedSchedules.length > 0 && (
                    <div className="flex items-start gap-2">
                      <CalendarDays size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Lịch học ({selectedSchedules.length} buổi/tuần)</p>
                        {selectedSchedules.map((id) => {
                          const sc = schedules.find((s) => s.idLichDay === id);
                          return sc ? (
                            <p key={id} className="text-xs font-medium text-slate-700">
                              {sc.tietHoc.thu} · {formatTime(sc.tietHoc.gioBatDau)}–{formatTime(sc.tietHoc.gioKetThuc)}
                            </p>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  {ngayBatDau && (
                    <div className="flex items-center gap-2">
                      <CalendarDays size={13} className="text-emerald-500 flex-shrink-0" />
                      <p className="text-xs text-slate-700">
                        Bắt đầu: <span className="font-semibold">{new Date(ngayBatDau).toLocaleDateString("vi-VN")}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ MODAL THANH TOÁN ══ */}
      {showPaymentModal && pendingBookingData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-semibold text-slate-900">Xác nhận thanh toán</h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[260px]">{course.tenKhoaHoc}</p>
              </div>
              <button
                onClick={() => !submitting && setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle size={14} className="flex-shrink-0" /> {error}
                </div>
              )}

              {/* Tóm tắt */}
              <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100 text-sm">
                {[
                  { label: "Khóa học", value: course.tenKhoaHoc },
                  { label: "Gia sư", value: course.tenGiaSu },
                  { label: "Môn học", value: course.tenMonHoc },
                  { label: "Số buổi", value: `${course.soBuoiHoc} buổi` },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="font-medium text-slate-800 text-right max-w-[180px] truncate">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-slate-500 font-medium">Tổng tiền</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(Number(course.soTienHoc))}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center gap-2">
                  <QrCode size={16} className="text-white" />
                  <p className="text-sm font-semibold text-white">Mã QR thanh toán</p>
                </div>
                <div className="p-5 flex flex-col items-center bg-white">
                  <div className="bg-white rounded-2xl border-2 border-slate-100 p-4 shadow-inner mb-3">
                    {PAYMENT_CONFIG.qrCodeUrl && PAYMENT_CONFIG.qrCodeUrl !== "[URL mã QR hoặc base64]" ? (
                      <img src={PAYMENT_CONFIG.qrCodeUrl} alt="QR thanh toán" className="w-48 h-48 rounded-xl" />
                    ) : (
                      <div className="w-48 h-48 bg-slate-50 rounded-xl flex flex-col items-center justify-center gap-2">
                        <QrCode size={40} className="text-slate-300" />
                        <p className="text-xs text-slate-400">QR Code</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 text-center">Quét mã bằng ứng dụng ngân hàng hoặc ví điện tử</p>
                </div>
              </div>

              {/* Hướng dẫn */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                  <AlertCircle size={12} /> Hướng dẫn chuyển khoản
                </p>
                <ol className="space-y-1">
                  {[
                    "Quét mã QR hoặc chuyển khoản theo thông tin hiển thị",
                    `Số tiền: ${formatCurrency(Number(course.soTienHoc))}`,
                    `Nội dung: Đặt lớp – ${course.tenKhoaHoc}`,
                    "Sau khi thanh toán, nhấn xác nhận bên dưới",
                  ].map((step, i) => (
                    <li key={i} className="text-xs text-amber-700 flex gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 font-semibold text-[10px]">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all disabled:opacity-50"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                  {submitting ? "Đang xử lý…" : "Tôi đã thanh toán"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}