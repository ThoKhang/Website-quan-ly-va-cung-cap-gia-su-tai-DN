"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, Text } from "@/component/ui";
import { getCourseDetail } from "@/services/khoa-hoc.service";
import { getGiaSuDetail } from "@/services/giasu.service";
import { useAuthStore } from "@/store/auth.store";
import type { KhoaHoc } from "@/types/khoa-hoc.type";
import type { GiaSuSearchResult } from "@/types/giasu.type";
import {
  Home, ChevronRight, ChevronLeft, Share2, Star, 
  Clock, BookOpen, Info, ClipboardList, ShieldCheck, 
  MessageSquare, CheckCircle2, UserCircle2, MapPin, PlayCircle
} from "lucide-react";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState<KhoaHoc | null>(null);
  const [tutor, setTutor] = useState<GiaSuSearchResult | null>(null);

  const idKhoaHoc = params.id as string;

  useEffect(() => {
    fetchCourseDetail();
  }, [idKhoaHoc]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCourseDetail(idKhoaHoc);
      const courseData = data as any;
      setCourse(courseData);

      // Fetch tutor info
      if (courseData.idGiaSu) {
        try {
          const tutorData = await getGiaSuDetail(courseData.idGiaSu);
          setTutor(tutorData);
        } catch (tutorErr) {
          console.error("Lỗi lấy thông tin gia sư:", tutorErr);
        }
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: any) => {
    const numValue = typeof value === "string" ? parseFloat(value) : Number(value);
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(numValue);
  };

  const SectionHeading = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
      <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shadow-sm border border-blue-100/50">
        {icon}
      </div>
      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{label}</h3>
    </div>
  );

  /* ── Loading & Error States ── */
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-sm font-bold text-slate-400 tracking-wide uppercase">Đang tải dữ liệu…</p>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white p-10 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full">
          <BookOpen size={64} className="mx-auto text-slate-200 mb-4" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">Khóa học không tồn tại</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "Khóa học này có thể đã bị xóa hoặc ngừng cung cấp."}</p>
          <Link href="/search">
            <button className="w-full py-3.5 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all">Quay lại tìm kiếm</button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 relative">

      {/* ══════════════════════════════════
          HERO BANNER
      ══════════════════════════════════ */}
      <div className="bg-[#0f172a] w-full pt-6 pb-48 relative overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm font-medium text-slate-400 mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5"><Home size={14} /> Trang chủ</Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0 opacity-50" />
            <Link href="/search" className="hover:text-white transition-colors">Tìm kiếm</Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0 opacity-50" />
            <span className="text-white font-bold truncate max-w-[200px]">{course.tenKhoaHoc}</span>
          </nav>

          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-bold group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Quay lại
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Đã sao chép liên kết!"); }}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl backdrop-blur-md transition-all border border-white/10 hover:border-white/20"
            >
              <Share2 size={14} /> Chia sẻ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-32 relative z-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ══════════════════════════════════
              CỘT TRÁI (8/12): THÔNG TIN KHÓA HỌC
          ══════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* THẺ HÌNH ẢNH & TIÊU ĐỀ */}
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100">
              <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-100 group">
                {course.anhMinhHoa ? (
                  <img src={course.anhMinhHoa} alt={course.tenKhoaHoc} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                    <BookOpen size={56} className="text-blue-200" strokeWidth={1.5} />
                  </div>
                )}
                {/* Gradient overlay để nổi bật chữ */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex items-end p-6 md:p-8">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap gap-2.5 mb-4">
                      <span className="bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-sm">
                        {course.tenMonHoc}
                      </span>
                      <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg border border-white/20">
                        {course.tenLop}
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-2 drop-shadow-md">
                      {course.tenKhoaHoc}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Lưới Thông số nhanh */}
              <div className="p-6 md:p-8 bg-white">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <Clock size={26} className="text-blue-500 mb-2.5" strokeWidth={1.5} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời lượng</p>
                    <p className="text-lg font-black text-slate-800">{course.soBuoiHoc || 0} buổi</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <Star size={26} className="text-amber-500 mb-2.5" strokeWidth={1.5} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Đánh giá</p>
                    <p className="text-lg font-black text-slate-800 flex items-center gap-1">
                      {course.saoTrungBinh?.toFixed(1) || "5.0"} <span className="text-xs font-medium text-slate-400">/ 5</span>
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <MapPin size={26} className="text-emerald-500 mb-2.5" strokeWidth={1.5} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Khu vực</p>
                    <p className="text-lg font-black text-slate-800">Đà Nẵng</p>
                  </div>
                  <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 shadow-sm flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:-translate-y-1 transition-all duration-300">
                    <CheckCircle2 size={26} className="text-blue-600 mb-2.5" strokeWidth={1.5} />
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Mỗi buổi</p>
                    <p className="text-lg font-black text-blue-700">
                      {formatCurrency(course.soTienHoc / (course.soBuoiHoc || 1)).split(' ')[0]}K
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* THẺ NỘI DUNG CHI TIẾT */}
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-8 space-y-8">
              <section>
                <SectionHeading icon={<Info size={22} />} label="Mô tả khóa học" />
                <p className="text-[15px] md:text-base leading-relaxed text-slate-600 font-medium">
                  {course.moTa || "Chưa có mô tả chi tiết cho khóa học này."}
                </p>
              </section>

              {course.yeuCau && (
                <section>
                  <SectionHeading icon={<ShieldCheck size={22} />} label="Yêu cầu đối với học viên" />
                  <div className="bg-amber-50/80 border border-amber-200/60 p-5 rounded-2xl">
                    <p className="text-[15px] md:text-base leading-relaxed text-amber-900 font-medium">
                      {course.yeuCau}
                    </p>
                  </div>
                </section>
              )}

              {course.noiDungKhoaHoc && (
                <section>
                  <SectionHeading icon={<ClipboardList size={22} />} label="Nội dung giảng dạy" />
                  <div className="rounded-2xl bg-slate-50/80 p-6 border border-slate-100">
                    <p className="text-[15px] md:text-base leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                      {course.noiDungKhoaHoc}
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* THẺ ĐÁNH GIÁ */}
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                  <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-500 border border-yellow-100/50 shadow-sm"><MessageSquare size={22} /></div>
                  Phản hồi từ Phụ huynh
                </h3>
                <div className="text-[11px] font-black text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                  {(course as any).danhGias?.length || 0} ĐÁNH GIÁ
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {(course as any).danhGias && (course as any).danhGias.length > 0 ? (
                  (course as any).danhGias.map((dg: any) => (
                    <div key={dg.idDanhGia} className="flex flex-col gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 flex-shrink-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black shadow-inner border-2 border-white">
                            {dg.anhDaiDien ? <img src={dg.anhDaiDien} alt="avt" className="h-full w-full object-cover rounded-full" /> : dg.tenPhuHuynh?.charAt(0) || "P"}
                          </div>
                          <div>
                            <Text className="text-[15px] font-bold text-slate-800">{dg.tenPhuHuynh || "Ẩn danh"}</Text>
                            <Text className="text-[11px] text-slate-400 font-medium mt-0.5">{new Date(dg.ngayDanhGia).toLocaleDateString("vi-VN")}</Text>
                          </div>
                        </div>
                        <div className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100 flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < dg.soSao ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[14px] text-slate-600 leading-relaxed italic line-clamp-3 font-medium">"{dg.noiDung}"</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                    <MessageSquare size={36} className="mx-auto text-slate-300 mb-3" strokeWidth={1.5} />
                    <p className="text-[15px] font-medium text-slate-500">Khóa học này mới mở, chưa có đánh giá nào.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ══════════════════════════════════
              CỘT PHẢI (4/12): SIDEBAR STICKY
          ══════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* THẺ ĐĂNG KÝ HỌC (STICKY) */}
            <div className="sticky top-6 space-y-6">
              
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8">
                <div className="mb-6 text-center">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">Học phí trọn khóa</span>
                  <p className="text-4xl font-black text-blue-600 mb-1.5 drop-shadow-sm">{formatCurrency(course.soTienHoc)}</p>
                  <p className="text-[13px] text-slate-500 font-medium">Cam kết không phát sinh phụ phí</p>
                </div>

                <div className="space-y-3 mb-8">
                  {['Học 1 kèm 1 chuyên nghiệp', 'Tương tác trực tiếp 100%', 'Cam kết đầu ra chuẩn', 'Hỗ trợ đổi giờ linh hoạt'].map((txt, i) => (
                    <div key={i} className="flex items-center gap-3.5 text-[15px] font-medium text-slate-700 p-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <CheckCircle2 size={14} strokeWidth={2.5} />
                      </div>
                      <span>{txt}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={!isLoggedIn ? `/login?redirectTo=/hoc-vien/booking/${idKhoaHoc}` : `/hoc-vien/booking/${idKhoaHoc}`}
                  className="block w-full"
                >
                  <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[15px] font-black uppercase tracking-wider shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(37,99,235,0.4)]">
                    {isLoggedIn ? "Đăng ký khóa học ngay" : "Đăng nhập để đăng ký"}
                  </button>
                </Link>
              </div>

              {/* THẺ PROFILE GIA SƯ */}
              {tutor && (
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-wider">Thông tin Gia sư</h4>
                  </div>
                  
                  <div className="flex gap-4 items-center mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="h-16 w-16 shrink-0 rounded-2xl bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-black text-2xl overflow-hidden">
                      {tutor.anhDaiDien ? (
                        <img src={tutor.anhDaiDien} alt={tutor.tenGiaSu} className="h-full w-full object-cover" />
                      ) : (
                        tutor.tenGiaSu.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 leading-tight mb-1.5">{tutor.tenGiaSu}</h4>
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="text-[13px] font-bold text-slate-700">{tutor.soSaoTrungBinh?.toFixed(1) || "5.0"}</span>
                        <span className="text-[11px] font-medium text-slate-400">({tutor.soLuongDanhGia || 0} đánh giá)</span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/search/gia-su/${tutor.idGiaSu}`} className="block w-full">
                    <button className="w-full py-3.5 text-[13px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100 flex items-center justify-center gap-1.5">
                      Xem hồ sơ năng lực <ChevronRight size={16} />
                    </button>
                  </Link>

                  {/* DANH SÁCH KHÓA HỌC KHÁC CỦA GIA SƯ */}
                  {tutor.khoaHocs && tutor.khoaHocs.filter(kh => kh.idKhoaHoc !== idKhoaHoc).length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <p className="text-[13px] font-black text-slate-800 mb-4 flex items-center gap-2">
                        <PlayCircle size={18} className="text-blue-500" strokeWidth={2}/> Các khóa học khác
                      </p>
                      <div className="grid gap-3">
                        {tutor.khoaHocs.filter(kh => kh.idKhoaHoc !== idKhoaHoc).slice(0, 3).map((kh) => (
                          <Link key={kh.idKhoaHoc} href={`/search/chi-tiet-khoa-hoc/${kh.idKhoaHoc}`}>
                            <div className="group p-3.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                              <h5 className="text-[13px] font-bold text-slate-700 group-hover:text-blue-600 line-clamp-1 mb-2 transition-colors">
                                {kh.tenKhoaHoc}
                              </h5>
                              <div className="flex justify-between items-end">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{kh.tenMonHoc}</span>
                                  <span className="text-[11px] font-medium text-slate-500">{kh.tenLop}</span>
                                </div>
                                <span className="text-[15px] font-black text-blue-600">{formatCurrency(kh.soTienHoc).split(' ')[0]}K</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {tutor.khoaHocs.length > 4 && (
                        <Link href={`/search/gia-su/${tutor.idGiaSu}`} className="block text-center mt-4">
                          <span className="text-[11px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">
                            Xem thêm {tutor.khoaHocs.length - 4} khóa học
                          </span>
                        </Link>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}