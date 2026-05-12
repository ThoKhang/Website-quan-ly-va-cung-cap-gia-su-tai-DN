"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, Text } from "@/component/ui";
import {
  hocVienService,
  type LichRanhResponse,
} from "@/services/hoc-vien.service";
import type { KhoaHocResponseDTO } from "@/types/khoa-hoc.type";
import { useAuthStore } from "@/store/auth.store";

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
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [ngayBatDau, setNgayBatDau] = useState("");
  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState("Tiền mặt");
  const [hocVienId, setHocVienId] = useState("");

  const idKhoaHoc = params.id as string;

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    fetchCourseDetail();
  }, [isLoggedIn, router, idKhoaHoc]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const courseData = await hocVienService.getCourseDetail(idKhoaHoc);
      setCourse(courseData);

      // Lấy lịch rảnh của gia sư
      const schedulesData = await hocVienService.getTutorSchedule(courseData.idGiaSu);
      setSchedules(schedulesData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleToggle = (idLichDay: string) => {
    setSelectedSchedules((prev) =>
      prev.includes(idLichDay)
        ? prev.filter((id) => id !== idLichDay)
        : [...prev, idLichDay]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!hocVienId) {
        setError("Vui lòng chọn học viên");
        setSubmitting(false);
        return;
      }

      if (selectedSchedules.length === 0) {
        setError("Vui lòng chọn ít nhất 1 buổi học");
        setSubmitting(false);
        return;
      }

      if (!ngayBatDau) {
        setError("Vui lòng chọn ngày bắt đầu học");
        setSubmitting(false);
        return;
      }

      await hocVienService.bookCourse({
        idPhuHuynh: idNguoiDung || "",
        idHocVien: hocVienId,
        idKhoaHoc,
        danhSachIdLichDay: selectedSchedules,
        phuongThucThanhToan,
        ngayBatDauHoc: ngayBatDau,
      });

      setSuccess("Đặt lớp thành công! Hệ thống đã tự động tạo lịch học cho bạn.");
      setTimeout(() => router.push("/hoc-vien/lich-su"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
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
          <Card className="bg-white p-8 text-center">
            <Text size="title" className="mb-4">
              Không tìm thấy khóa học
            </Text>
            <Link href="/search">
              <Button>Quay lại tìm kiếm</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="content-lock px-6 py-10 md:px-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Text as="h1" size="display">
              Đặt Lớp
            </Text>
            <Text size="lead" tone="muted" className="mt-2">
              {course.tenKhoaHoc}
            </Text>
          </div>
          <Link href="/search">
            <Button variant="secondary">Quay lại</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form booking */}
          <div className="lg:col-span-2">
            <Card className="bg-white p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <Text size="body" className="text-red-700">
                      {error}
                    </Text>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Text size="body" className="text-green-700">
                      {success}
                    </Text>
                  </div>
                )}

                {/* Chọn học viên */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn học viên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hocVienId}
                    onChange={(e) => setHocVienId(e.target.value)}
                    placeholder="Nhập ID học viên hoặc tên học viên"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Text size="caption" tone="muted" className="mt-1">
                    Nếu chưa có học viên, vui lòng{" "}
                    <Link href="/hoc-vien/ho-so" className="text-blue-600 hover:underline">
                      tạo hồ sơ học viên
                    </Link>
                  </Text>
                </div>

                {/* Chọn lịch học */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Chọn lịch học <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {schedules.length === 0 ? (
                      <Text tone="muted">Gia sư chưa đăng ký lịch rảnh</Text>
                    ) : (
                      schedules.map((schedule) => (
                        <label
                          key={schedule.idLichDay}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSchedules.includes(schedule.idLichDay)}
                            onChange={() => handleScheduleToggle(schedule.idLichDay)}
                            disabled={!schedule.tinhTrang}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <Text size="body" className="font-medium">
                              {schedule.tietHoc.thu}
                            </Text>
                            <Text size="caption" tone="muted">
                              {formatTime(schedule.tietHoc.gioBatDau)} -{" "}
                              {formatTime(schedule.tietHoc.gioKetThuc)}
                            </Text>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              schedule.tinhTrang
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {schedule.tinhTrang ? "Rảnh" : "Đã đặt"}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  <Text size="caption" tone="muted" className="mt-2">
                    Đã chọn: {selectedSchedules.length} buổi
                  </Text>
                </div>

                {/* Ngày bắt đầu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={ngayBatDau}
                    onChange={(e) => setNgayBatDau(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Phương thức thanh toán */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phương thức thanh toán
                  </label>
                  <select
                    value={phuongThucThanhToan}
                    onChange={(e) => setPhuongThucThanhToan(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Tiền mặt</option>
                    <option>Chuyển khoản</option>
                    <option>Ví điện tử</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Đang xử lý..." : "Đặt lớp"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Thông tin khóa học */}
          <div>
            <Card className="bg-white p-6 sticky top-20">
              <Text as="h3" size="title" className="mb-4">
                Thông Tin Khóa Học
              </Text>

              <div className="space-y-4">
                <div>
                  <Text size="caption" tone="muted">
                    Tên khóa học
                  </Text>
                  <Text size="body" className="font-semibold">
                    {course.tenKhoaHoc}
                  </Text>
                </div>

                <div>
                  <Text size="caption" tone="muted">
                    Gia sư
                  </Text>
                  <Text size="body" className="font-semibold">
                    {course.tenGiaSu}
                  </Text>
                </div>

                <div>
                  <Text size="caption" tone="muted">
                    Môn học
                  </Text>
                  <Text size="body" className="font-semibold">
                    {course.tenMonHoc}
                  </Text>
                </div>

                <div>
                  <Text size="caption" tone="muted">
                    Cấp lớp
                  </Text>
                  <Text size="body" className="font-semibold">
                    {course.tenLop}
                  </Text>
                </div>

                <div>
                  <Text size="caption" tone="muted">
                    Số buổi học
                  </Text>
                  <Text size="body" className="font-semibold">
                    {course.soBuoiHoc} buổi
                  </Text>
                </div>

                <div>
                  <Text size="caption" tone="muted">
                    Giá tiền / buổi
                  </Text>
                  <Text size="display" className="font-bold text-blue-600">
                    {formatCurrency(Number(course.soTienHoc))}
                  </Text>
                </div>

                <div>
                  <Text size="caption" tone="muted">
                    Đánh giá
                  </Text>
                  <Text size="body" className="font-semibold">
                    ⭐ {course.saoTrungBinh || 0}/5
                  </Text>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Text size="caption" tone="muted">
                    Tổng tiền (dự tính)
                  </Text>
                  <Text size="display" className="font-bold text-green-600">
                    {formatCurrency(
                      Number(course.soTienHoc) * (selectedSchedules.length || 1)
                    )}
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
