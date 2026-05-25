"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { hocVienService } from "@/services/hoc-vien.service";
import {
  Star, Award, BookOpen, GraduationCap, MapPin,
  MessageSquare, UserCircle2, CheckCircle2, ChevronLeft,
  Loader2, Phone, Mail, BadgeCheck, ShieldCheck
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
  // front-end tự tính từ courses/reviews
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
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300"}
        />
      ))}
    </span>
  );
}

function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-slate-400">{icon}</span>
      <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">{label}</h3>
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
        bangCapList: (tutorData as any).bangCapList || [] // Nếu không có thì gán là []
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-500" size={36} />
          <p className="text-sm text-slate-500">Đang tải hồ sơ gia sư…</p>
        </div>
      </main>
    );
  }

  /* ── Not found ── */
  if (!tutor) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <UserCircle2 size={56} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">Không tìm thấy gia sư</h2>
          <button
            onClick={() => router.back()}
            className="mt-5 px-5 py-2.5 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition-colors"
          >
            Quay lại
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
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ══════════════════════════════════
          TOP BAR
      ══════════════════════════════════ */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={18} />
            Quay lại tìm kiếm
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ══════════════════════════════════
            PROFILE CARD
        ══════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Thin accent bar */}
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-blue-50 flex items-center justify-center border border-blue-100 text-2xl font-semibold text-blue-600">
                  {initials}
                </div>
                {bangCapDaDuyet.length > 0 && (
                  <span
                    title="Đã xác thực"
                    className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 rounded-full p-1 border-2 border-white"
                  >
                    <ShieldCheck size={12} className="text-white" />
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                    Mã: {tutor.idGiaSu}
                  </span>
                  <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Star size={10} className="fill-amber-500" />
                    {tutor.saoTrungBinh.toFixed(1)}
                  </span>
                  {bangCapDaDuyet.length > 0 && (
                    <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <BadgeCheck size={10} /> Đã xác thực
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                  {tutor.tenGiaSu}
                </h1>

                {/* Stats row */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={15} className="text-blue-400" />
                    {soKhoa} khóa học
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare size={15} className="text-indigo-400" />
                    {soDanhGia} đánh giá
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-rose-400" />
                    Đà Nẵng
                  </span>
                  {tutor.sdt && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={15} className="text-slate-400" />
                      {tutor.sdt}
                    </span>
                  )}
                  {tutor.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail size={15} className="text-slate-400" />
                      {tutor.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            CONTENT GRID
        ══════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">

          {/* ── LEFT: Credentials ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <SectionHeading icon={<GraduationCap size={16} />} label="Bằng cấp" />

            {tutor.bangCapList.length === 0 ? (
              <div className="text-center py-8">
                <Award size={28} className="mx-auto text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">Chưa có bằng cấp</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {tutor.bangCapList.map((bc) => (
                  <li
                    key={bc.idBangCap}
                    className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Award size={15} className="text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-snug">
                        {bc.tenBangCap}
                      </p>
                      {bc.thongTinBangCap && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {bc.thongTinBangCap}
                        </p>
                      )}
                      {bc.trangThai === 1 ? (
                        <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Đã kiểm chứng
                        </p>
                      ) : bc.trangThai === 0 ? (
                        <p className="text-[11px] text-amber-500 font-medium mt-1">⏳ Đang xét duyệt</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── RIGHT: Courses + Reviews ── */}
          <div className="space-y-6">

            {/* Courses */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <SectionHeading icon={<BookOpen size={16} />} label="Khóa học đang giảng dạy" />

              {courses.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen size={28} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">Gia sư chưa mở khóa học nào.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {courses.map((c) => (
                    <div
                      key={c.idKhoaHoc}
                      className="group border border-slate-100 rounded-xl overflow-hidden hover:border-slate-200 hover:shadow-sm transition-all flex flex-col"
                    >
                      {/* Thumbnail */}
                      <div className="h-28 bg-slate-50 overflow-hidden relative flex-shrink-0">
                        {c.anhMinhHoa ? (
                          <img
                            src={c.anhMinhHoa}
                            alt={c.tenKhoaHoc}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                            <BookOpen size={28} className="text-blue-200" />
                          </div>
                        )}
                        {/* Rating badge */}
                        <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-sm">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          {c.saoTrungBinh.toFixed(1)}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex gap-1.5 mb-2.5 flex-wrap">
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                            {c.tenMonHoc}
                          </span>
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {c.tenLop}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 mb-3">
                          {c.tenKhoaHoc}
                        </p>

                        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                          <div>
                            <p className="text-[11px] text-slate-400">{c.soBuoiHoc} buổi</p>
                            <p className="text-base font-bold text-blue-600">{fmt(c.soTienHoc)}</p>
                          </div>
                          <Link href={`/search/khoa-hoc/${c.idKhoaHoc}`}>
                            <button className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors">
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

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <SectionHeading icon={<MessageSquare size={16} />} label="Nhận xét từ phụ huynh" />

              {reviews.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare size={28} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">Chưa có đánh giá nào.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {reviews.map((rv) => (
                    <li key={rv.idDanhGia} className="py-5 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          {/* Initials avatar */}
                          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-sm font-semibold text-indigo-600 flex-shrink-0 border border-indigo-100">
                            {rv.tenPhuHuynh.charAt(rv.tenPhuHuynh.lastIndexOf(" ") + 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{rv.tenPhuHuynh}</p>
                            <p className="text-[11px] text-slate-400">{rv.ngayDanhGia}</p>
                          </div>
                        </div>
                        <StarRow rating={rv.soSao} size={13} />
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed pl-12">{rv.noiDung}</p>
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