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

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn, loaiNguoiDungID } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState<KhoaHoc | null>(null);
  const [tutor, setTutor] = useState<GiaSuSearchResult | null>(null);

  const idKhoaHoc = params.id as string;
  const isParent = loaiNguoiDungID === "1";

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

      console.log("Course data:", courseData);
      console.log("idGiaSu:", courseData.idGiaSu);

      // Fetch tutor info if idGiaSu is available
      if (courseData.idGiaSu) {
        try {
          const tutorData = await getGiaSuDetail(courseData.idGiaSu);
          console.log("Tutor data:", tutorData);
          setTutor(tutorData);
        } catch (tutorErr) {
          console.error("Error fetching tutor detail:", tutorErr);
          // Don't set error for tutor, just continue
        }
      } else {
        console.warn("No idGiaSu found in course data");
      }
    } catch (err: any) {
      console.error("Error fetching course detail:", err);
      setError(err.message || "Có lỗi xảy ra khi tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: any) => {
    const numValue = typeof value === "string" ? parseFloat(value) : Number(value);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numValue);
  };

  if (loading) {
    return (
      <main className="page-shell">
        <div className="content-lock px-6 py-10 md:px-10">
          <Text>Đang tải...</Text>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="page-shell">
        <div className="content-lock px-6 py-10 md:px-10">
          <div className="mb-8">
            <Link href="/search">
              <Button variant="secondary">← Quay lại</Button>
            </Link>
          </div>
          <Card className="bg-white p-8 text-center">
            <Text size="title" className="text-red-600">
              {error || "Không tìm thấy khóa học"}
            </Text>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell bg-slate-50/50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/search">
            <Button variant="ghost" className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
              <span className="text-lg transition-transform group-hover:-translate-x-1">←</span>
              <span className="text-sm font-medium">Trở về</span>
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="h-9 text-xs font-bold uppercase tracking-wider"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Đã sao chép liên kết vào bộ nhớ tạm!");
              }}
            >
              Chia sẻ
            </Button>
            <Link href={!isLoggedIn ? `/auth/login?redirectTo=/hoc-vien/booking/${idKhoaHoc}` : `/hoc-vien/booking/${idKhoaHoc}`}>
              <Button className="h-9 bg-blue-600 px-6 text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/20">Đăng ký lớp</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-3">
            <Text className="text-sm text-red-600 font-medium">
              {error}
            </Text>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Content Area: 8 columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Hero Section */}
            <Card className="overflow-hidden border-none bg-white p-0 shadow-sm ring-1 ring-slate-200">
              <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-100">
                <img
                  src={course.anhMinhHoa || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop"}
                  alt={course.tenKhoaHoc}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-6">
                  <div className="max-w-xl">
                    <div className="mb-2 flex gap-2">
                      <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        {course.tenMonHoc}
                      </span>
                      <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md uppercase tracking-wider">
                        {course.tenLop}
                      </span>
                    </div>
                    <Text as="h1" className="text-2xl font-black text-white leading-tight">
                      {course.tenKhoaHoc}
                    </Text>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 border-b border-slate-100 pb-6">
                  <div className="space-y-0.5">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Học phí</Text>
                    <Text className="text-lg font-black text-blue-600">{formatCurrency(course.soTienHoc)}</Text>
                  </div>
                  <div className="space-y-0.5">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời lượng</Text>
                    <Text className="text-lg font-black text-slate-700">{course.soBuoiHoc || 0} buổi</Text>
                  </div>
                  <div className="space-y-0.5">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đánh giá</Text>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      <Text className="text-lg font-black text-slate-700">{course.saoTrungBinh?.toFixed(1) || "5.0"}</Text>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mỗi buổi</Text>
                    <Text className="text-lg font-black text-slate-500">
                      {formatCurrency(course.soTienHoc / (course.soBuoiHoc || 1)).split(' ')[0]}K
                    </Text>
                  </div>
                </div>

                <div className="space-y-6">
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-1 w-4 bg-blue-600 rounded"></div>
                      <Text className="text-xs font-black uppercase tracking-widest text-slate-800">Mô tả khóa học</Text>
                    </div>
                    <Text className="text-sm leading-relaxed text-slate-600">
                      {course.moTa || "Chưa có mô tả chi tiết cho khóa học này."}
                    </Text>
                  </section>

                  {course.yeuCau && (
                    <section>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-1 w-4 bg-blue-600 rounded"></div>
                        <Text className="text-xs font-black uppercase tracking-widest text-slate-800">Yêu cầu</Text>
                      </div>
                      <Text className="text-sm leading-relaxed text-slate-600">
                        {course.yeuCau}
                      </Text>
                    </section>
                  )}

                  {course.noiDungKhoaHoc && (
                    <section>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-1 w-4 bg-blue-600 rounded"></div>
                        <Text className="text-xs font-black uppercase tracking-widest text-slate-800">Nội dung học</Text>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                        <Text className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                          {course.noiDungKhoaHoc}
                        </Text>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </Card>

            {/* Reviews Section */}
            <Card className="border-none bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-4 bg-yellow-500 rounded"></div>
                  <Text className="text-xs font-black uppercase tracking-widest text-slate-800">Phản hồi từ học viên</Text>
                </div>
                <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  {(course as any).danhGias?.length || 0} ĐÁNH GIÁ
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {(course as any).danhGias && (course as any).danhGias.length > 0 ? (
                  (course as any).danhGias.map((dg: any) => (
                    <div key={dg.idDanhGia} className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50/50 border border-slate-100 ">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden border border-slate-200">
                          {dg.anhDaiDien ? (
                            <img src={dg.anhDaiDien} alt={dg.tenPhuHuynh} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-blue-600">{dg.tenPhuHuynh?.charAt(0) || "P"}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text className="text-xs font-bold text-slate-800 truncate block">{dg.tenPhuHuynh || "Ẩn danh"}</Text>
                          <div className="flex gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-[10px] ${i < dg.soSao ? "text-yellow-400" : "text-slate-300"}`}>★</span>
                            ))}
                          </div>
                        </div>
                        <Text className="text-[9px] text-slate-400 font-medium">
                          {new Date(dg.ngayDanhGia).toLocaleDateString("vi-VN")}
                        </Text>
                      </div>
                      <Text className="text-xs text-slate-600 italic line-clamp-3">"{dg.noiDung}"</Text>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <Text className="text-sm text-slate-400">Chưa có đánh giá nào cho khóa học này.</Text>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Area: 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            {/* Sticky Booking Card */}
            <div className="sticky top-6">
              <Card className="border-none bg-white p-5 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 overflow-hidden rounded-2xl">
                <div className="mb-5">
                  <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Khóa học cam kết</Text>
                  <div className="flex items-baseline gap-1">
                    <Text className="text-2xl font-black text-blue-600">{formatCurrency(course.soTienHoc)}</Text>
                    <Text className="text-[10px] text-slate-400 font-bold">/ trọn gói</Text>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {['Học 1-1 Chuyên nghiệp', 'Tương tác trực tiếp', 'Cam kết đầu ra'].map((txt, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] font-medium text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] text-blue-600 font-black">✓</span>
                      <span>{txt}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Link
                    href={!isLoggedIn ? `/auth/login?redirectTo=/hoc-vien/booking/${idKhoaHoc}` : `/hoc-vien/booking/${idKhoaHoc}`}
                    className="block w-full"
                  >
                    <Button className="w-full h-11 bg-blue-600 text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-[1.02]">
                      {isLoggedIn ? "Đăng ký học ngay" : "Đăng nhập để đăng ký"}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full h-11 text-xs font-bold text-slate-500 hover:text-blue-600 border border-slate-100"
                    onClick={() => alert("Gia sư sẽ liên hệ với bạn trong vòng 24h để tư vấn miễn phí!")}
                  >
                    Tư vấn miễn phí
                  </Button>
                </div>
              </Card>

              {/* Tutor Profile Card */}
              {tutor && (
                <Card className="mt-6 border-none bg-white p-5 shadow-sm ring-1 ring-slate-200 rounded-2xl">
                  <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-5">
                    <div className="h-10 w-10 shrink-0 rounded-full ring-2 ring-blue-50">
                      <img
                        src={tutor.anhDaiDien || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.tenGiaSu)}&background=random`}
                        alt={tutor.tenGiaSu}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <Text className="text-xs font-black text-slate-800 block truncate max-w-[150px]">{tutor.tenGiaSu}</Text>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-yellow-400 text-[10px]">★</span>
                        <Text className="text-[10px] font-black text-slate-600">{tutor.soSaoTrungBinh?.toFixed(1) || "5.0"}</Text>
                        <Text className="text-[9px] font-bold text-slate-300">({tutor.soLuongDanhGia || 0})</Text>
                      </div>
                    </div>
                  </div>

                  {tutor.khoaHocs && tutor.khoaHocs.length > 1 && (
                    <div className="space-y-3">
                      <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Khóa học khác</Text>
                      <div className="grid gap-2">
                        {tutor.khoaHocs.filter(kh => kh.idKhoaHoc !== idKhoaHoc).slice(0, 3).map((kh) => (
                          <Link key={kh.idKhoaHoc} href={`/search/chi-tiet-khoa-hoc/${kh.idKhoaHoc}`} className="group p-2 rounded-lg bg-slate-50/50 hover:bg-blue-50/50 transition-colors border border-slate-100 hover:border-blue-100">
                            <Text className="text-[11px] font-bold text-slate-700 block truncate group-hover:text-blue-700">{kh.tenKhoaHoc}</Text>
                            <div className="flex justify-between items-center mt-1">
                              <Text className="text-[9px] text-slate-400">{kh.tenMonHoc} · {kh.tenLop}</Text>
                              <Text className="text-[10px] font-black text-blue-600">{formatCurrency(kh.soTienHoc).split(' ')[0]}K</Text>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link href={`/search/gia-su/${tutor.idGiaSu}`} className="mt-4 block text-[10px] font-black text-center text-slate-400 hover:text-blue-600 uppercase tracking-wider transition-colors">
                    Xem hồ sơ gia sư →
                  </Link>
                </Card>
              )}

              {/* Schedule Card */}
              {tutor && tutor.lichRanh && tutor.lichRanh.length > 0 && (
                <Card className="mt-6 border-none bg-white p-5 shadow-sm ring-1 ring-slate-200 rounded-2xl">
                  <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">Lịch dạy sẵn có</Text>
                  <div className="grid grid-cols-2 gap-2">
                    {tutor.lichRanh.map((lich) => (
                      <div key={lich.idLichDay} className="flex items-center gap-2 p-1.5 rounded bg-slate-50 border border-slate-100">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white text-[9px] font-black shadow-sm text-slate-600 border border-slate-200 uppercase">
                          {lich.tietHoc.thu.replace("Thứ ", "T")}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">{lich.tietHoc.gioBatDau.substring(0, 5)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
