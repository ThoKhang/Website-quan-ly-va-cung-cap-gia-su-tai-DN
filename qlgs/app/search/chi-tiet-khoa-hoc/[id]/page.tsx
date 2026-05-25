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
    <main className="page-shell bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/search">
            <Button variant="ghost" className="group flex items-center gap-2">
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              Quay lại tìm kiếm
            </Button>
          </Link>
          <div className="flex gap-3">
            {isParent && (
              <Link href={`/hoc-vien/booking/${idKhoaHoc}`}>
                <Button className="shadow-lg shadow-blue-500/20">Đặt lớp ngay</Button>
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4">
            <Text size="body" className="text-red-700">
              {error}
            </Text>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <Card className="overflow-hidden border-none bg-white p-0 shadow-sm ring-1 ring-black/5">
              <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  src={course.anhMinhHoa || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop"}
                  alt={course.tenKhoaHoc}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <div>
                    <div className="mb-3 flex gap-2">
                      <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                        {course.tenMonHoc}
                      </span>
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                        {course.tenLop}
                      </span>
                    </div>
                    <Text as="h1" size="display" className="text-white drop-shadow-sm">
                      {course.tenKhoaHoc}
                    </Text>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="flex flex-col">
                    <Text size="caption" tone="muted" className="mb-1 uppercase tracking-wider font-bold">Giá học phí</Text>
                    <Text size="title" className="text-blue-600 font-bold">{formatCurrency(course.soTienHoc)}</Text>
                  </div>
                  <div className="flex flex-col">
                    <Text size="caption" tone="muted" className="mb-1 uppercase tracking-wider font-bold">Thời lượng</Text>
                    <Text size="title" className="font-bold">{course.soBuoiHoc || 0} buổi</Text>
                  </div>
                  <div className="flex flex-col">
                    <Text size="caption" tone="muted" className="mb-1 uppercase tracking-wider font-bold">Đánh giá</Text>
                    <div className="flex items-center gap-1.5">
                      <span className="text-yellow-400">★</span>
                      <Text size="title" className="font-bold">{course.saoTrungBinh?.toFixed(1) || "5.0"}</Text>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Text size="caption" tone="muted" className="mb-1 uppercase tracking-wider font-bold">Học phí / buổi</Text>
                    <Text size="title" className="text-gray-600 font-bold">
                      {formatCurrency(course.soTienHoc / (course.soBuoiHoc || 1))}
                    </Text>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Text size="title" className="mb-3 font-bold border-l-4 border-blue-600 pl-4 uppercase tracking-wider text-sm">
                      Mô tả khóa học
                    </Text>
                    <Text size="body" className="leading-relaxed text-gray-700">
                      {course.moTa || "Chưa có mô tả chi tiết cho khóa học này."}
                    </Text>
                  </div>

                  {course.yeuCau && (
                    <div>
                      <Text size="title" className="mb-3 font-bold border-l-4 border-blue-600 pl-4 uppercase tracking-wider text-sm">
                        Yêu cầu đầu vào
                      </Text>
                      <Text size="body" className="leading-relaxed text-gray-700">
                        {course.yeuCau}
                      </Text>
                    </div>
                  )}

                  {course.noiDungKhoaHoc && (
                    <div>
                      <Text size="title" className="mb-3 font-bold border-l-4 border-blue-600 pl-4 uppercase tracking-wider text-sm">
                        Nội dung giảng dạy
                      </Text>
                      <Text size="body" className="leading-relaxed text-gray-700 whitespace-pre-line">
                        {course.noiDungKhoaHoc}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Reviews Section */}
            <Card className="border-none bg-white p-8 shadow-sm ring-1 ring-black/5">
              <div className="mb-8 flex items-center justify-between">
                <Text size="title" className="font-bold uppercase tracking-wider text-sm border-l-4 border-yellow-500 pl-4">
                  Đánh giá từ phụ huynh
                </Text>
                <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-1.5 text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                  <span className="text-sm font-bold">{course.saoTrungBinh?.toFixed(1) || "5.0"}</span>
                  <span className="text-yellow-400">★</span>
                </div>
              </div>

              <div className="space-y-6">
                {(course as any).danhGias && (course as any).danhGias.length > 0 ? (
                  (course as any).danhGias.map((dg: any) => (
                    <div key={dg.idDanhGia} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white hover:shadow-md">
                      <div className="h-12 w-12 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {dg.anhDaiDien ? (
                          <img src={dg.anhDaiDien} alt={dg.tenPhuHuynh} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-blue-600">{dg.tenPhuHuynh?.charAt(0) || "P"}</span>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <Text size="bodyStrong">{dg.tenPhuHuynh || "Phụ huynh ẩn danh"}</Text>
                          <Text size="caption" tone="muted">
                            {new Date(dg.ngayDanhGia).toLocaleDateString("vi-VN")}
                          </Text>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < dg.soSao ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                          ))}
                        </div>
                        <Text size="body" className="text-gray-600 italic">"{dg.noiDung}"</Text>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-3 text-4xl text-gray-200">💬</div>
                    <Text tone="muted">Chưa có đánh giá nào cho khóa học này.</Text>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Tutor Profile Card */}
            {tutor && (
              <Card className="border-none bg-white p-6 shadow-lg ring-1 ring-black/5">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 h-24 w-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-1">
                    <div className="h-full w-full rounded-full bg-white p-1 overflow-hidden">
                      <img
                        src={tutor.anhDaiDien || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.tenGiaSu)}&background=random`}
                        alt={tutor.tenGiaSu}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1.5 border-4 border-white"></div>
                  </div>

                  <Text as="h3" size="title" className="font-bold">{tutor.tenGiaSu}</Text>
                  <Text size="caption" tone="muted" className="mb-4">Gia sư Chuyên nghiệp</Text>

                  <div className="w-full grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <Text size="caption" tone="muted" className="mb-1 block">Khóa học</Text>
                      <Text className="font-bold">{tutor.soLuongKhoaHoc || 0}</Text>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <Text size="caption" tone="muted" className="mb-1 block">Đánh giá</Text>
                      <Text className="font-bold">{tutor.soSaoTrungBinh?.toFixed(1) || "5.0"} ★</Text>
                    </div>
                  </div>

                  {tutor.bangCap && (
                    <div className="mb-6 w-full text-left rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                      <Text size="caption" tone="primary" className="mb-1 uppercase tracking-wider font-bold text-[10px]">
                        Chứng chỉ/Bằng cấp
                      </Text>
                      <Text size="caption" className="font-medium text-blue-900">{tutor.bangCap.tenBangCap}</Text>
                    </div>
                  )}

                  <div className="w-full space-y-3">
                    <Button variant="secondary" className="w-full">Xem hồ sơ đầy đủ</Button>
                    <Link href={`/search/gia-su/${tutor.idGiaSu}`} className="block w-full text-sm font-medium text-blue-600 hover:text-blue-700">
                      Gửi tin nhắn riêng
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* Other Courses Card */}
            {tutor && tutor.khoaHocs && tutor.khoaHocs.length > 1 && (
              <Card className="border-none bg-white p-6 shadow-sm ring-1 ring-black/5">
                <Text size="title" className="mb-6 font-bold uppercase tracking-wider text-xs border-l-4 border-indigo-600 pl-4">
                  Khóa học khác của gia sư
                </Text>
                <div className="space-y-4">
                  {tutor.khoaHocs.filter(kh => kh.idKhoaHoc !== idKhoaHoc).slice(0, 3).map((kh) => (
                    <Link key={kh.idKhoaHoc} href={`/search/chi-tiet-khoa-hoc/${kh.idKhoaHoc}`} className="group block space-y-1">
                      <Text size="bodyStrong" className="group-hover:text-blue-600 transition-colors line-clamp-1">{kh.tenKhoaHoc}</Text>
                      <div className="flex items-center justify-between">
                        <Text size="caption" tone="muted">{kh.tenMonHoc} · {kh.tenLop}</Text>
                        <Text size="caption" className="font-bold text-gray-700">{formatCurrency(kh.soTienHoc)}</Text>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Schedule Card */}
            {tutor && tutor.lichRanh && tutor.lichRanh.length > 0 && (
              <Card className="border-none bg-white p-6 shadow-sm ring-1 ring-black/5">
                <Text size="title" className="mb-6 font-bold uppercase tracking-wider text-xs border-l-4 border-green-600 pl-4">
                  Lịch dạy khả dụng
                </Text>
                <div className="space-y-3">
                  {tutor.lichRanh.map((lich) => (
                    <div key={lich.idLichDay} className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow-sm">
                          {lich.tietHoc.thu.replace("Thứ ", "T")}
                        </span>
                        <span>{lich.tietHoc.gioBatDau.substring(0, 5)} - {lich.tietHoc.gioKetThuc.substring(0, 5)}</span>
                      </div>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-green-600/20">
                        SẴN SÀNG
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
