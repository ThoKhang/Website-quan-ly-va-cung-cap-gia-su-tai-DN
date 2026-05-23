"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Section } from "@/component/ui";
import { hocVienService, type DangKyHocResponse } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";

export default function ExtendCoursePage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn, idNguoiDung } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [courseData, setCourseData] = useState<DangKyHocResponse | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [canExtend, setCanExtend] = useState(false);
  const [ngayBatDauMoi, setNgayBatDauMoi] = useState("");
  const [minDate, setMinDate] = useState("");

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
      
      // Tìm khóa học theo idDangKy (trim để loại bỏ khoảng trắng)
      const course = bookingHistory.find((d) => d.idDangKy?.trim() === idDangKy?.trim());

      if (!course) {
        setError("Không tìm thấy khóa học");
        setLoading(false);
        return;
      }

      // Kiểm tra xem khóa học có đang học không
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(course.ngayBatDauHoc);
      startDate.setHours(0, 0, 0, 0);

      const endDate = course.ngayKetThucDuKien 
        ? new Date(course.ngayKetThucDuKien)
        : new Date(startDate);
      endDate.setHours(0, 0, 0, 0);

      // Tính số ngày còn lại
      const diffTime = endDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setDaysRemaining(daysLeft);

      // Kiểm tra điều kiện: chỉ gia hạn khi còn lại <= 15 ngày
      if (daysLeft > 15) {
        setCanExtend(false);
        setError(`Chỉ có thể gia hạn trong 15 ngày trước khi kết thúc khóa học. Hiện tại còn ${daysLeft} ngày.`);
      } else if (daysLeft <= 0) {
        setCanExtend(false);
        setError("Khóa học đã kết thúc. Không thể gia hạn.");
      } else {
        setCanExtend(true);
        // Tính ngày tối thiểu = ngày kết thúc + 1 ngày
        const minDateObj = new Date(endDate);
        minDateObj.setDate(minDateObj.getDate() + 1);
        const minDateStr = minDateObj.toISOString().split('T')[0];
        setMinDate(minDateStr);
        setNgayBatDauMoi(minDateStr); // Mặc định là ngày tối thiểu
      }

      setCourseData(course);
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
      if (!canExtend) {
        setError("Không thể gia hạn khóa học này");
        setSubmitting(false);
        return;
      }

      if (!ngayBatDauMoi) {
        setError("Vui lòng chọn ngày bắt đầu mới");
        setSubmitting(false);
        return;
      }

      await hocVienService.extendCourse(idDangKy?.trim(), ngayBatDauMoi);

      // Kiểm tra nếu đã gia hạn rồi thì hiển thị thông báo cập nhật, không phải gia hạn
      if (courseData?.ngayGiaHan) {
        setSuccess("Cập nhật ngày học thành công!");
      } else {
        setSuccess("Gia hạn khóa học thành công! Đơn đăng ký mới đang chờ gia sư duyệt.");
      }
      setTimeout(() => router.push("/hoc-vien/lich-su"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
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
              <h1 className="text-3xl font-bold text-slate-900">
                {courseData?.ngayGiaHan ? "✏️ Chỉnh Sửa Ngày Học" : "📅 Gia Hạn Khóa Học"}
              </h1>
              <p className="text-slate-500 mt-1">
                {courseData?.ngayGiaHan 
                  ? "Cập nhật ngày bắt đầu học mới" 
                  : "Kéo dài thời gian học của bạn"}
              </p>
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
                <p className="text-sm text-slate-500 font-medium mb-1">Ngày bắt đầu</p>
                <p className="text-lg font-semibold text-slate-900">
                  {new Date(courseData.ngayBatDauHoc).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Ngày kết thúc dự kiến</p>
                <p className="text-lg font-semibold text-slate-900">
                  {courseData.ngayKetThucDuKien 
                    ? new Date(courseData.ngayKetThucDuKien).toLocaleDateString("vi-VN")
                    : "Chưa xác định"}
                </p>
              </div>
            </div>
          </div>

          {/* DAYS REMAINING INFO */}
          <div className={`flex items-center gap-3 px-5 py-4 border rounded-xl ${
            daysRemaining <= 15 && daysRemaining > 0
              ? "bg-yellow-50 border-yellow-200 text-yellow-800"
              : daysRemaining <= 0
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}>
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="font-medium">
              {daysRemaining > 15
                ? `Khóa học còn ${daysRemaining} ngày. Bạn chỉ có thể gia hạn khi còn lại ≤ 15 ngày.`
                : daysRemaining > 0
                ? `Khóa học còn ${daysRemaining} ngày. Bạn có thể gia hạn ngay bây giờ!`
                : "Khóa học đã kết thúc. Không thể gia hạn."}
            </span>
          </div>

          {/* EXTENSION FORM */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
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

              {/* INFO BOX */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  {courseData?.ngayGiaHan ? "📋 Cập Nhật Ngày Học" : "📋 Thông Tin Gia Hạn"}
                </h3>
                <ul className="space-y-2 text-blue-800">
                  {courseData?.ngayGiaHan ? (
                    <>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Cập nhật ngày bắt đầu học mới cho khóa học này</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Ngày bắt đầu hiện tại: {new Date(courseData.ngayBatDauHoc).toLocaleDateString("vi-VN")}</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Lịch dạy sẽ y nguyên như khóa học hiện tại</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Gia hạn sẽ tạo một đơn đăng ký mới với cùng số buổi học</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Ngày bắt đầu tối thiểu: {courseData.ngayKetThucDuKien 
                          ? new Date(new Date(courseData.ngayKetThucDuKien).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN")
                          : "Chưa xác định"}</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Đơn đăng ký mới sẽ ở trạng thái "Chờ duyệt" cho gia sư xem xét</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Lịch dạy sẽ y nguyên như khóa học hiện tại</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* DATE PICKER */}
              <div className="space-y-3">
                <label className="block text-lg font-bold text-slate-900">
                  📅 Chọn Ngày Bắt Đầu Mới
                </label>
                <style>{`
                  input[type="date"] {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  }
                  input[type="date"]::-webkit-calendar-picker-indicator {
                    cursor: pointer;
                  }
                `}</style>
                <input
                  type="date"
                  value={ngayBatDauMoi}
                  onChange={(e) => setNgayBatDauMoi(e.target.value)}
                  min={minDate}
                  disabled={!canExtend}
                  className={`w-full px-4 py-3 border rounded-lg font-medium transition ${
                    canExtend
                      ? "border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      : "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  }`}
                />
                <p className="text-sm text-slate-500">
                  Ngày bắt đầu phải từ {minDate ? new Date(minDate).toLocaleDateString("vi-VN") : "..."} trở đi
                </p>
                {ngayBatDauMoi && (
                  <p className="text-sm text-blue-600 font-medium">
                    Ngày đã chọn: {new Date(ngayBatDauMoi).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || !canExtend}
                  className={`flex-1 font-bold px-6 py-3 rounded-lg transition ${
                    canExtend
                      ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận gia hạn"}
                </button>
                <Link href="/hoc-vien/lich-su" className="flex-1">
                  <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-lg">
                    Quay lại
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </Section>
    </main>
  );
}
