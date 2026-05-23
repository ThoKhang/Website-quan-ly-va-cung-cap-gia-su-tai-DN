"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Section } from "@/component/ui";
import { hocVienService, type DangKyHocResponse, type DanhGiaResponse } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";

export default function RateCoursePage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn, idNguoiDung } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [soSao, setSoSao] = useState(5);
  const [noiDung, setNoiDung] = useState("");
  const [courseData, setCourseData] = useState<DangKyHocResponse | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [existingRating, setExistingRating] = useState<any>(null);

  const idDangKy = params.id as string;

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    fetchCourseData();
  }, [isLoggedIn, router, idDangKy]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      if (!idNguoiDung) {
        setError("Không tìm thấy thông tin người dùng");
        return;
      }

      // Lấy danh sách khóa học đã đăng ký
      const bookingHistory = await hocVienService.getBookingHistory(idNguoiDung);
      console.log("📚 Booking History:", bookingHistory);
      console.log("🔍 Looking for idDangKy:", idDangKy);
      
      // Tìm khóa học theo idDangKy (trim để loại bỏ khoảng trắng)
      const course = bookingHistory.find((d) => d.idDangKy?.trim() === idDangKy?.trim());
      console.log("📖 Found Course:", course);

      if (!course) {
        console.error("❌ Course not found. Available IDs:", bookingHistory.map(d => `"${d.idDangKy}"`));
        setError("Không tìm thấy khóa học");
        setLoading(false);
        return;
      }

      // Kiểm tra xem khóa học đã hoàn thành chưa
      if (!course.trangThaiHoanThanh) {
        setError("Khóa học chưa hoàn thành. Bạn chỉ có thể đánh giá khi khóa học đã hoàn thành!");
        setLoading(false);
        return;
      }

      setCourseData(course);

      // Nếu đã có đánh giá, load dữ liệu cũ
      try {
        const rating = await hocVienService.getRating(idDangKy?.trim());
        console.log("📝 Existing Rating:", rating);
        setExistingRating(rating);
        setSoSao(rating.soSao);
        setNoiDung(rating.noiDung || "");
      } catch (err: any) {
        // Nếu không có đánh giá hoặc endpoint chưa tồn tại, bỏ qua
        console.log("ℹ️ No existing rating found or endpoint not available");
        setExistingRating(null);
      }

      // Tính ngày kết thúc từ buổi học cuối cùng
      if (course.chiTietLichHoc && course.chiTietLichHoc.length > 0) {
        const lastSession = course.chiTietLichHoc[course.chiTietLichHoc.length - 1];
        const endDate = new Date(lastSession.ngayHoc);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - endDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        console.log("📅 End Date:", endDate, "Days passed:", diffDays);

        // Có thể chỉnh sửa trong vòng 7 ngày kể từ lúc kết thúc
        setCanEdit(diffDays <= 7);
        setDaysRemaining(Math.max(0, 7 - diffDays));
      }
    } catch (err: any) {
      console.error("❌ Error fetching course data:", err);
      setError(err.response?.data?.message || err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (soSao < 1 || soSao > 5) {
        setError("Vui lòng chọn số sao từ 1 đến 5");
        setSubmitting(false);
        return;
      }

      if (!canEdit) {
        setError("Thời gian chỉnh sửa đánh giá đã hết (7 ngày kể từ kết thúc khóa học)");
        setSubmitting(false);
        return;
      }

      await hocVienService.rateCourse({
        idDangKy,
        soSao,
        noiDung,
      });

      setSuccess("Cảm ơn bạn đã gửi đánh giá!");
      setTimeout(() => router.push("/hoc-vien/lich-su"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (interactive: boolean = true) => {
    return (
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "button"}
            disabled={!interactive}
            onClick={() => interactive && setSoSao(star)}
            className={`text-5xl transition ${
              star <= soSao
                ? "text-yellow-400"
                : "text-slate-300"
            } ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pb-16 pt-8">
        <Section>
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded-lg w-48 mx-auto mb-4" />
              <div className="h-4 bg-slate-200 rounded-lg w-96 mx-auto" />
            </div>
          </div>
        </Section>
      </main>
    );
  }

  if (!courseData) {
    return (
      <main className="min-h-screen bg-slate-50 pb-16 pt-8">
        <Section>
          <div className="max-w-2xl mx-auto px-4">
            <Link href="/hoc-vien/lich-su">
              <Button className="mb-6 bg-slate-600 hover:bg-slate-700 text-white font-medium px-4 py-2.5 rounded-lg">
                ← Quay lại lịch sử
              </Button>
            </Link>
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ⚠️
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy khóa học</h2>
              <p className="text-slate-500">{error}</p>
            </div>
          </div>
        </Section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16 pt-8">
      <Section>
        <div className="max-w-3xl mx-auto px-4 space-y-8">
          
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">⭐ Đánh Giá Khóa Học</h1>
              <p className="text-slate-500 mt-1">Chia sẻ trải nghiệm của bạn về khóa học này</p>
            </div>
            <Link href="/hoc-vien/lich-su">
              <Button className="bg-slate-600 hover:bg-slate-700 text-white font-medium px-4 py-2.5 rounded-lg">
                ← Quay lại
              </Button>
            </Link>
          </div>

          {/* COURSE INFO CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">📚 Thông Tin Khóa Học</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Tên khóa học</p>
                <p className="text-lg font-semibold text-slate-900">{courseData.khoaHoc.tenKhoaHoc}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Giảng viên</p>
                <p className="text-lg font-semibold text-slate-900">{courseData.khoaHoc.tenGiaSu}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Môn học</p>
                <p className="text-lg font-semibold text-slate-900">{courseData.khoaHoc.tenMonHoc}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Cấp lớp</p>
                <p className="text-lg font-semibold text-slate-900">{courseData.khoaHoc.tenLop}</p>
              </div>
            </div>
          </div>

          {/* EDIT TIME LIMIT WARNING */}
          {!canEdit && (
            <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="font-medium">Thời gian chỉnh sửa đánh giá đã hết (7 ngày kể từ kết thúc khóa học)</span>
            </div>
          )}

          {canEdit && daysRemaining > 0 && (
            <div className="flex items-center gap-3 px-5 py-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="font-medium">Bạn còn {daysRemaining} ngày để chỉnh sửa đánh giá</span>
            </div>
          )}

          {/* RATING FORM */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            {/* EXISTING RATING DISPLAY */}
            {existingRating && (
              <div className="mb-8 pb-8 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">📋 Đánh Giá Của Bạn</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {Array(existingRating.soSao).fill("⭐").join("")}
                      </span>
                      <span className="text-lg font-bold text-blue-600">{existingRating.soSao}/5 sao</span>
                    </div>
                    <span className="text-sm text-slate-600">
                      📅 {new Date(existingRating.ngayDanhGia).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {existingRating.noiDung && (
                    <div className="bg-white rounded-lg p-4 mt-4">
                      <p className="text-slate-700">{existingRating.noiDung}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FORM CHỈ HIỂN THỊ KHI CHƯA CÓ ĐÁNH GIÁ HOẶC CÒN TRONG 7 NGÀY */}
            {!existingRating && (
              <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-3 px-5 py-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span className="font-medium">{success}</span>
                </div>
              )}

              {/* STAR RATING */}
              <div>
                <label className="block text-lg font-bold text-slate-900 mb-4">
                  Đánh giá của bạn <span className="text-red-500">*</span>
                </label>
                <div className="mb-3">
                  {renderStars(canEdit)}
                </div>
                <p className="text-sm text-slate-600">
                  Bạn đã chọn: <span className="font-bold text-yellow-500">{soSao} sao</span>
                </p>
              </div>

              {/* COMMENT */}
              <div>
                <label className="block text-lg font-bold text-slate-900 mb-3">
                  Nhận xét (tùy chọn)
                </label>
                <textarea
                  value={noiDung}
                  onChange={(e) => setNoiDung(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Chia sẻ ý kiến của bạn về khóa học, gia sư, phương pháp dạy, ..."
                  rows={6}
                  className={`w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !canEdit ? "bg-slate-100 cursor-not-allowed" : "bg-white"
                  }`}
                />
                <p className="text-sm text-slate-500 mt-2">{noiDung.length}/300 ký tự</p>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || !canEdit}
                  className={`flex-1 font-bold px-6 py-3 rounded-lg transition ${
                    canEdit
                      ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
                <Link href="/hoc-vien/lich-su" className="flex-1">
                  <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-lg">
                    Quay lại
                  </Button>
                </Link>
              </div>
              </form>
            )}
          </div>
        </div>
      </Section>
    </main>
  );
}
