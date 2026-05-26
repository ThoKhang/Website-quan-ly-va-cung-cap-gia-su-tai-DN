"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { hocVienService } from "@/services/hoc-vien.service";
import {
  Star, Award, BookOpen, GraduationCap, MapPin,
  MessageSquare, UserCircle2, CheckCircle2, ChevronLeft,
  Loader2, Phone, Mail, BadgeCheck, ShieldCheck, Home, ChevronRight
} from "lucide-react";

/* ────────────────────────────────────────────
   TYPES  (khớp với backend response)
──────────────────────────────────────────── */

interface BangCapDTO {
  idBangCap: string;
  tenBangCap: string;
  thongTinBangCap?: string;
  ngayCap?: string;
  anhMinhChung?: string;
  trangThai: number; // 0 = chờ duyệt, 1 = đã duyệt, 2 = từ chối
}

interface GiaSuDetail {
  idGiaSu: string;
  tenGiaSu: string;
  sdt?: string;
  email?: string;
  saoTrungBinh: number;
  bangCapList: BangCapDTO[];
  soLuongKhoaHoc?: number;
  soLuongDanhGia?: number;
}

interface KhoaHocResponseDTO {
  idKhoaHoc: string;
  tenKhoaHoc: string;
  tenMonHoc: string;
  tenLop: string;
  soTienHoc: number;
  soBuoiHoc: number;
  saoTrungBinh: number;
  anhMinhHoa?: string;
}

interface DanhGiaDTO {
  idDanhGia: string;
  tenPhuHuynh: string;
  soSao: number;
  noiDung: string;
  ngayDanhGia: string;
}

/* ────────────────────────────────────────────
   HELPER COMPONENTS
──────────────────────────────────────────── */

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
        />
      ))}
    </span>
  );
}

function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
      <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
        {icon}
      </div>
      <h3 className="text-lg font-black text-slate-800">{label}</h3>
    </div>
  );
}

/* ────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────── */

export default function TutorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const idGiaSu = params.id as string;

  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState<GiaSuDetail | null>(null);
  const [courses, setCourses] = useState<KhoaHocResponseDTO[]>([]);
  const [reviews, setReviews] = useState<DanhGiaDTO[]>([]);

  useEffect(() => {
    fetchAll();
  }, [idGiaSu]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [tutorData, coursesData, reviewsData] = await Promise.all([
        hocVienService.getTutorDetail(idGiaSu),
        hocVienService.getTutorCourses(idGiaSu).catch(() => []),
        hocVienService.getTutorReviews(idGiaSu).catch(() => []),
      ]);
      setTutor({
        ...tutorData,
        bangCapList: (tutorData as any).bangCapList || [] 
      });
      setCourses(coursesData);
      setReviews(reviewsData);
    } catch (err) {
      console.error("Lỗi tải hồ sơ gia sư:", err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  /* ── Loading ── */
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
          <p className="text-sm font-medium text-slate-500 tracking-wide">Đang tải hồ sơ gia sư…</p>
        </div>
      </main>
    );
  }

  /* ── Not found ── */
  if (!tutor) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white p-10 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full">
          <UserCircle2 size={64} className="mx-auto text-slate-200 mb-4" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">Không tìm thấy gia sư</h2>
          <p className="text-slate-500 text-sm mb-6">Hồ sơ này có thể đã bị xóa hoặc không tồn tại trên hệ thống.</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3.5 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
          >
            Quay lại tìm kiếm
          </button>
        </div>
      </main>
    );
  }

  /* ── Derived stats ── */
  const soKhoa = courses.length;
  const soDanhGia = reviews.length;
  const bangCapDaDuyet = tutor.bangCapList.filter((b) => b.trangThai === 1);

  /* ── Initials avatar fallback ── */
  const initials = tutor.tenGiaSu
    ? tutor.tenGiaSu.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase()
    : "GS";

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 relative">

      {/* ══════════════════════════════════
          HERO BACKGROUND & BREADCRUMBS
      ══════════════════════════════════ */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 w-full pt-6 pb-40 relative overflow-hidden">
        {/* Decorative blur elements for visual interest */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          
          {/* Điều hướng (Breadcrumbs) */}
          <nav className="flex items-center text-sm font-medium text-blue-200/70 mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Home size={14} /> Trang chủ
            </Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <Link href="/search" className="hover:text-white transition-colors">
              Tìm kiếm
            </Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <span className="text-white font-bold">Hồ sơ Gia sư</span>
          </nav>

          {/* Nút quay lại (Dành cho Mobile hoặc tiện ích) */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Quay lại kết quả tìm kiếm
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-28 relative z-20">

        {/* ══════════════════════════════════
            PROFILE CARD (MAIN INFO)
        ══════════════════════════════════ */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 p-6 md:p-10 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Avatar & Badges */}
            <div className="flex flex-col items-center flex-shrink-0 relative">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2rem] bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-white shadow-md text-4xl md:text-5xl font-black text-blue-600 rotate-3 transition-transform hover:rotate-0">
                {initials}
              </div>
              {bangCapDaDuyet.length > 0 && (
                <div className="absolute -bottom-3 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border-2 border-white shadow-sm flex items-center gap-1">
                  <ShieldCheck size={12} /> Đã xác thực
                </div>
              )}
            </div>

            {/* Core Info */}
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[11px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-md uppercase tracking-wider">
                  MÃ GS: {tutor.idGiaSu}
                </span>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-3 py-1 rounded-md">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  <span className="text-xs font-bold text-amber-700">
                    {tutor.saoTrungBinh > 0 ? tutor.saoTrungBinh.toFixed(1) : "Chưa có đánh giá"}
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-5 leading-tight">
                {tutor.tenGiaSu}
              </h1>

              {/* Stat Highlights */}
              <div className="flex flex-wrap items-center gap-4 md:gap-8 text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Giảng dạy</p>
                    <p className="text-slate-800 font-bold">{soKhoa} khóa học</p>
                  </div>
                </div>

                <div className="hidden md:block w-px h-8 bg-slate-200" />

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Nhận xét</p>
                    <p className="text-slate-800 font-bold">{soDanhGia} đánh giá</p>
                  </div>
                </div>

                <div className="hidden md:block w-px h-8 bg-slate-200" />

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Khu vực</p>
                    <p className="text-slate-800 font-bold">Đà Nẵng</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info (if available) */}
            {(tutor.sdt || tutor.email) && (
              <div className="flex-shrink-0 w-full md:w-auto bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl space-y-3">
                {tutor.sdt && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      <Phone size={14} className="text-slate-500" />
                    </div>
                    <span className="font-semibold text-slate-700">{tutor.sdt}</span>
                  </div>
                )}
                {tutor.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      <Mail size={14} className="text-slate-500" />
                    </div>
                    <span className="font-semibold text-slate-700 truncate max-w-[200px]">{tutor.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════
            CONTENT GRID
        ══════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">

          {/* ── LEFT COLUMN: Credentials ── */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 lg:sticky lg:top-6">
            <SectionHeading icon={<GraduationCap size={20} />} label="Hồ sơ năng lực" />

            {tutor.bangCapList.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Award size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">Chưa cập nhật bằng cấp</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {tutor.bangCapList.map((bc) => (
                  <li
                    key={bc.idBangCap}
                    className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:border-blue-200 hover:bg-blue-50/30 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:border-blue-300 group-hover:text-blue-600 transition-colors">
                      <Award size={18} className="text-slate-400 group-hover:text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-snug mb-1">
                        {bc.tenBangCap}
                      </p>
                      {bc.thongTinBangCap && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                          {bc.thongTinBangCap}
                        </p>
                      )}
                      {bc.trangThai === 1 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                          <CheckCircle2 size={12} /> Đã kiểm chứng
                        </span>
                      ) : bc.trangThai === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                          <Loader2 size={12} className="animate-spin" /> Đang xét duyệt
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── RIGHT COLUMN: Courses + Reviews ── */}
          <div className="space-y-8">

            {/* Courses Section */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
              <SectionHeading icon={<BookOpen size={20} />} label="Khóa học đang giảng dạy" />

              {courses.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <BookOpen size={28} className="text-slate-300" />
                  </div>
                  <h4 className="text-slate-700 font-bold mb-1">Chưa có khóa học</h4>
                  <p className="text-sm text-slate-500">Gia sư hiện chưa mở lớp nào mới trên hệ thống.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {courses.map((c) => (
                    <div
                      key={c.idKhoaHoc}
                      className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all flex flex-col"
                    >
                      {/* Thumbnail */}
                      <div className="h-36 bg-slate-100 overflow-hidden relative">
                        {c.anhMinhHoa ? (
                          <img
                            src={c.anhMinhHoa}
                            alt={c.tenKhoaHoc}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                            <BookOpen size={36} className="text-white/30" />
                          </div>
                        )}
                        {/* Rating Badge */}
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-black text-slate-800 shadow-sm flex items-center gap-1">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {c.saoTrungBinh > 0 ? c.saoTrungBinh.toFixed(1) : "Mới"}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex gap-2 mb-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                            {c.tenMonHoc}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                            {c.tenLop}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 leading-snug line-clamp-2 mb-4 group-hover:text-blue-600 transition-colors">
                          {c.tenKhoaHoc}
                        </h4>

                        {/* Footer (Price & Action) */}
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
                          <div>
                            <p className="text-[11px] font-medium text-slate-400 mb-0.5 uppercase tracking-wide">
                              Thời lượng {c.soBuoiHoc} buổi
                            </p>
                            <p className="text-lg font-black text-blue-600">
                              {fmt(c.soTienHoc)}
                            </p>
                          </div>
                          <Link href={`/search/chi-tiet-khoa-hoc/${c.idKhoaHoc}`}>
                            <button className="px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-sm">
                              Chi tiết
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
              <SectionHeading icon={<MessageSquare size={20} />} label="Đánh giá từ phụ huynh" />

              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={24} className="text-slate-300" />
                  </div>
                  <h4 className="text-slate-700 font-bold mb-1">Chưa có nhận xét</h4>
                  <p className="text-sm text-slate-500">Trở thành người đầu tiên đánh giá sau khi hoàn thành khóa học.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {reviews.map((rv) => (
                    <li key={rv.idDanhGia} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center text-sm font-black text-amber-800 shadow-sm">
                            {rv.tenPhuHuynh.charAt(rv.tenPhuHuynh.lastIndexOf(" ") + 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{rv.tenPhuHuynh}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{rv.ngayDanhGia}</p>
                          </div>
                        </div>
                        <div className="bg-white px-2.5 py-1 rounded-lg shadow-sm border border-slate-100">
                          <StarRow rating={rv.soSao} size={12} />
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed pt-1">
                        "{rv.noiDung}"
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>{/* end right col */}
        </div>{/* end content grid */}
      </div>{/* end container */}
    </main>
  );
}