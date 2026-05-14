"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, Text } from "@/component/ui";
import {
  hocVienService,
  type LichRanhResponse,
  type HocVienListItem,
} from "@/services/hoc-vien.service";
import type { KhoaHocResponseDTO } from "@/types/khoa-hoc.type";
import { useAuthStore } from "@/store/auth.store";
import { PAYMENT_CONFIG } from "@/config/payment.config";

interface TimeSlotSelection {
  id: string; // Unique identifier
  idLichDay: string;
  dayOfWeek: string;
  slotStartTime: string;
  slotEndTime: string;
  selectedStartTime: string;
  selectedEndTime: string;
  errors: {
    startTime?: string;
    endTime?: string;
  };
}

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
  const [timeSlotSelections, setTimeSlotSelections] = useState<TimeSlotSelection[]>([]);
  const [ngayBatDau, setNgayBatDau] = useState("");
  const [phuongThucThanhToan] = useState("Chuyển khoản");
  const [hocVienId, setHocVienId] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<any>(null);

  const idKhoaHoc = params.id as string;

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    fetchData();
  }, [isLoggedIn, router, idKhoaHoc]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Lấy thông tin khóa học
      const courseData = await hocVienService.getCourseDetail(idKhoaHoc);
      setCourse(courseData);

      // Lấy lịch rảnh của gia sư từ idGiaSu trong course data
      if (courseData.idGiaSu) {
        const schedulesData = await hocVienService.getTutorSchedule(courseData.idGiaSu);
        
        // Loại bỏ slot trùng lặp dựa trên idLichDay
        const seenIds = new Set<string>();
        const uniqueSchedules = schedulesData.filter((schedule) => {
          if (seenIds.has(schedule.idLichDay)) {
            return false;
          }
          seenIds.add(schedule.idLichDay);
          return true;
        });
        
        console.log("Original schedules:", schedulesData.length);
        console.log("Unique schedules:", uniqueSchedules.length);
        
        setSchedules(uniqueSchedules);
      } else {
        console.warn("No idGiaSu found in course data");
        setSchedules([]);
      }

      // Lấy danh sách học viên của phụ huynh
      const hocVienData = await hocVienService.getHocVienList();
      setHocVienList(hocVienData);
      
      // Tự động chọn học viên đầu tiên nếu có
      if (hocVienData.length > 0) {
        setHocVienId(hocVienData[0].idHocVien);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleToggle = (idLichDay: string, schedule: LichRanhResponse) => {
    setSelectedSchedules((prev) => {
      const isSelected = prev.includes(idLichDay);
      if (isSelected) {
        // Xóa lịch được chọn
        setTimeSlotSelections((prevSelections) =>
          prevSelections.filter((s) => s.idLichDay !== idLichDay)
        );
        return prev.filter((id) => id !== idLichDay);
      } else {
        // Thêm lịch được chọn - chỉ thêm nếu chưa tồn tại
        setTimeSlotSelections((prevSelections) => {
          // Kiểm tra xem slot này đã được thêm chưa
          const alreadyExists = prevSelections.some((s) => s.idLichDay === idLichDay);
          if (alreadyExists) {
            return prevSelections;
          }
          
          const uniqueId = `${idLichDay}_${Date.now()}_${Math.random()}`;
          const newSelection: TimeSlotSelection = {
            id: uniqueId,
            idLichDay,
            dayOfWeek: schedule.tietHoc.thu,
            slotStartTime: schedule.tietHoc.gioBatDau,
            slotEndTime: schedule.tietHoc.gioKetThuc,
            selectedStartTime: schedule.tietHoc.gioBatDau,
            selectedEndTime: schedule.tietHoc.gioKetThuc,
            errors: {},
          };
          return [...prevSelections, newSelection];
        });
        return [...prev, idLichDay];
      }
    });
  };

  const validateTimeSlot = (selection: TimeSlotSelection): TimeSlotSelection => {
    const errors: { startTime?: string; endTime?: string } = {};
    const startTime = selection.selectedStartTime;
    const endTime = selection.selectedEndTime;
    const slotStart = selection.slotStartTime;
    const slotEnd = selection.slotEndTime;

    if (startTime < slotStart) {
      errors.startTime = `Giờ bắt đầu không được sớm hơn ${slotStart.substring(0, 5)}`;
    }

    if (endTime > slotEnd) {
      errors.endTime = `Giờ kết thúc không được muộn hơn ${slotEnd.substring(0, 5)}`;
    }

    if (startTime >= endTime) {
      errors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
    }

    return { ...selection, errors };
  };

  const handleTimeSlotChange = (
    id: string,
    field: "selectedStartTime" | "selectedEndTime",
    value: string
  ) => {
    setTimeSlotSelections((prevSelections) =>
      prevSelections.map((selection) => {
        if (selection.id === id) {
          const updated = { ...selection, [field]: value };
          return validateTimeSlot(updated);
        }
        return selection;
      })
    );
  };

  const hasTimeSlotErrors = (): boolean => {
    return timeSlotSelections.some((selection) => Object.keys(selection.errors).length > 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      if (hasTimeSlotErrors()) {
        setError("Vui lòng kiểm tra lại thời gian học");
        setSubmitting(false);
        return;
      }

      if (!ngayBatDau) {
        setError("Vui lòng chọn ngày bắt đầu học");
        setSubmitting(false);
        return;
      }

      if (!acceptedTerms) {
        setError("Vui lòng chấp nhận các điều khoản và chính sách");
        setSubmitting(false);
        return;
      }

      // Chuẩn bị dữ liệu gửi lên backend
      const bookingData = {
        idPhuHuynh: idNguoiDung || "",
        idHocVien: hocVienId,
        idKhoaHoc,
        danhSachIdLichDay: selectedSchedules,
        danhSachThoiGianHoc: timeSlotSelections.map((selection) => ({
          idLichDay: selection.idLichDay,
          gioBatDau: selection.selectedStartTime,
          gioKetThuc: selection.selectedEndTime,
        })),
        phuongThucThanhToan: "Chuyển khoản",
        ngayBatDauHoc: ngayBatDau,
      };

      // Lưu dữ liệu và hiển thị modal thanh toán
      setPendingBookingData(bookingData);
      setShowPaymentModal(true);
      setSubmitting(false);
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
      
      // Gọi API để lưu khóa học
      await hocVienService.bookCourse(pendingBookingData);

      // Hiển thị thông báo thành công
      setSuccess("✅ Đặt lớp thành công! Khóa học đã được lưu vào lịch sử của bạn. Vui lòng hoàn tất thanh toán để xác nhận đăng ký.");
      
      // Đóng modal thanh toán
      setShowPaymentModal(false);
      
      // Chuyển hướng đến trang lịch sử sau 2 giây
      setTimeout(() => {
        router.push("/hoc-vien/lich-su");
      }, 2000);
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.response?.data?.message || "Có lỗi xảy ra khi đặt lớp. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  const getSelectedHocVien = () => {
    return hocVienList.find((hv) => hv.idHocVien === hocVienId);
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
                  {hocVienList.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Text size="body" className="text-yellow-700">
                        Bạn chưa có học viên nào. Vui lòng{" "}
                        <Link href="/hoc-vien/ho-so" className="font-semibold hover:underline">
                          tạo hồ sơ học viên
                        </Link>
                      </Text>
                    </div>
                  ) : (
                    <select
                      value={hocVienId}
                      onChange={(e) => setHocVienId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn học viên --</option>
                      {hocVienList.map((hv) => (
                        <option key={hv.idHocVien} value={hv.idHocVien}>
                          {hv.tenHocVien} (ID: {hv.idHocVien})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Thông tin học viên được chọn */}
                {getSelectedHocVien() && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Text size="caption" tone="muted" className="mb-1">
                      Học viên được chọn
                    </Text>
                    <Text size="body" className="font-semibold">
                      {getSelectedHocVien()?.tenHocVien}
                    </Text>
                    <Text size="caption" tone="muted" className="mt-1">
                      Ngày sinh: {new Date(getSelectedHocVien()?.ngaySinh || "").toLocaleDateString("vi-VN")}
                    </Text>
                  </div>
                )}

                {/* Chọn lịch học */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Chọn lịch học <span className="text-red-500">*</span>
                  </label>
                  <Text size="caption" tone="muted" className="mb-3 block">
                    Chọn các buổi học rảnh của gia sư.
                  </Text>
                  <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {schedules.length === 0 ? (
                      <Text tone="muted" className="text-center py-4">
                        Gia sư chưa đăng ký lịch rảnh
                      </Text>
                    ) : (
                      schedules.map((schedule) => (
                        <label
                          key={schedule.idLichDay}
                          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                            selectedSchedules.includes(schedule.idLichDay)
                              ? "bg-blue-50 border-blue-300"
                              : schedule.tinhTrang
                              ? "bg-white border-gray-200 hover:bg-gray-50"
                              : "bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSchedules.includes(schedule.idLichDay)}
                            onChange={() => handleScheduleToggle(schedule.idLichDay, schedule)}
                            disabled={!schedule.tinhTrang}
                            className="w-5 h-5 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Text size="body" className="font-semibold">
                                {schedule.tietHoc.thu}
                              </Text>
                              <Text size="caption" className="text-gray-600">
                                {formatTime(schedule.tietHoc.gioBatDau)} - {formatTime(schedule.tietHoc.gioKetThuc)}
                              </Text>
                            </div>
                            <Text size="caption" tone="muted">
                              {schedule.tietHoc.soTiet} tiết ({schedule.tietHoc.soTiet * 45} phút)
                            </Text>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              schedule.tinhTrang
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-300 text-gray-700"
                            }`}
                          >
                            {schedule.tinhTrang ? "✓ Rảnh" : "✗ Đã đặt"}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  <Text size="caption" tone="muted" className="mt-3 block">
                    📌 Đã chọn: <span className="font-semibold">{selectedSchedules.length} buổi</span>
                  </Text>
                </div>

                {/* Đăng ký thời gian học */}
                {timeSlotSelections.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Đăng ký thời gian học (chọn thời gian cụ thể khác nếu cần)<span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-4">
                      {timeSlotSelections.map((selection) => (
                        <div
                          key={selection.id}
                          className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <div className="mb-4">
                            <Text size="body" className="font-semibold text-gray-700">
                              {selection.dayOfWeek}
                            </Text>
                            <Text size="caption" tone="muted">
                              Lịch rảnh: {formatTime(selection.slotStartTime)} - {formatTime(selection.slotEndTime)}
                            </Text>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {/* Giờ bắt đầu */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giờ bắt đầu
                              </label>
                              <input
                                type="time"
                                value={selection.selectedStartTime}
                                onChange={(e) =>
                                  handleTimeSlotChange(
                                    selection.id,
                                    "selectedStartTime",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                  selection.errors.startTime
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-blue-500"
                                }`}
                              />
                              {selection.errors.startTime && (
                                <Text size="caption" className="text-red-600 mt-1">
                                  {selection.errors.startTime}
                                </Text>
                              )}
                            </div>

                            {/* Giờ kết thúc */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giờ kết thúc
                              </label>
                              <input
                                type="time"
                                value={selection.selectedEndTime}
                                onChange={(e) =>
                                  handleTimeSlotChange(
                                    selection.id,
                                    "selectedEndTime",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                  selection.errors.endTime
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-blue-500"
                                }`}
                              />
                              {selection.errors.endTime && (
                                <Text size="caption" className="text-red-600 mt-1">
                                  {selection.errors.endTime}
                                </Text>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ngày bắt đầu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={ngayBatDau}
                    onChange={(e) => setNgayBatDau(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Text size="caption" tone="muted" className="mt-1">
                    Chọn ngày bắt đầu từ hôm nay trở đi
                  </Text>
                </div>

                {/* Phương thức thanh toán */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phương thức thanh toán
                  </label>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Text size="body" className="font-semibold text-gray-700">
                      💳 Chuyển khoản
                    </Text>
                    <Text size="caption" tone="muted" className="mt-2">
                      Khóa học sẽ được xác nhận đăng ký thành công khi bạn hoàn tất quy trình thanh toán trên hệ thống.
                    </Text>
                  </div>
                </div>

                {/* Chấp nhận điều khoản */}
                <div>
                  <label className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-5 h-5 rounded mt-1 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <Text size="body" className="font-semibold text-gray-700 mb-2">
                        Tôi đồng ý với các điều khoản và chính sách
                      </Text>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div>
                          <Text size="caption" className="font-semibold text-gray-700 block mb-1">
                            📋 Chính sách Đặt khóa học và Thanh toán
                          </Text>
                          <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>Khóa học chỉ được xác nhận đăng ký thành công khi hoàn tất quy trình thanh toán</li>
                            <li>Trạng thái đăng ký sẽ được cập nhật công khai trong hồ sơ tài khoản</li>
                            <li>Mức học phí hiển thị là mức phí cuối cùng, không có phụ phí ẩn</li>
                          </ul>
                        </div>

                        <div>
                          <Text size="caption" className="font-semibold text-gray-700 block mb-1">
                            👨‍👩‍👧 Quyền và Trách nhiệm của Phụ huynh/Học viên
                          </Text>
                          <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>Học viên cần tham gia đúng giờ, tôn trọng Gia sư và hoàn thành yêu cầu môn học</li>
                            <li>Hệ thống không cam kết tuyệt đối về điểm số nếu học viên không tuân thủ lộ trình</li>
                            <li>Đảm bảo môi trường học tập an toàn, văn minh</li>
                            <li>Hành vi vi phạm đạo đức, pháp luật sẽ bị xử lý và khóa tài khoản vĩnh viễn</li>
                          </ul>
                        </div>

                        <div>
                          <Text size="caption" className="font-semibold text-gray-700 block mb-1">
                            ⚖️ Giải quyết tranh chấp
                          </Text>
                          <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>Hệ thống đóng vai trò là nền tảng kết nối và trung gian giải quyết khiếu nại</li>
                            <li>Tranh chấp được xử lý dựa trên dữ liệu lịch sử trên website</li>
                            <li>Quyết định của Ban quản trị hệ thống là quyết định cao nhất</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </label>
                  {!acceptedTerms && (
                    <Text size="caption" className="text-red-600 mt-2 block">
                      ⚠️ Vui lòng chấp nhận các điều khoản để tiếp tục
                    </Text>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting || hocVienList.length === 0 || !acceptedTerms}
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
                    {formatCurrency(Number(course.soTienHoc) / (course.soBuoiHoc || 1))}
                  </Text>
                </div>

                <div>
                  <Text size="caption" tone="muted">
                    Tổng tiền khóa học
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
              </div>
            </Card>
          </div>
        </div>

        {/* Modal thanh toán */}
        {showPaymentModal && pendingBookingData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <Text as="h2" size="display">
                    Xác nhận thanh toán
                  </Text>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    disabled={submitting}
                    className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✕
                  </button>
                </div>

                {/* Hiển thị lỗi trong modal */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <Text size="body" className="text-red-700">
                      {error}
                    </Text>
                  </div>
                )}

                {/* Thông tin khóa học */}
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Text size="caption" className="font-semibold text-gray-700 block mb-3">
                      📚 Thông tin khóa học
                    </Text>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Text size="body" tone="muted">Tên khóa học:</Text>
                        <Text size="body" className="font-semibold">{course?.tenKhoaHoc}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text size="body" tone="muted">Gia sư:</Text>
                        <Text size="body" className="font-semibold">{course?.tenGiaSu}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text size="body" tone="muted">Môn học:</Text>
                        <Text size="body" className="font-semibold">{course?.tenMonHoc}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text size="body" tone="muted">Cấp lớp:</Text>
                        <Text size="body" className="font-semibold">{course?.tenLop}</Text>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-blue-200">
                        <Text size="body" tone="muted">Số buổi học:</Text>
                        <Text size="body" className="font-semibold">{course?.soBuoiHoc} buổi</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text size="body" tone="muted">Tổng tiền:</Text>
                        <Text size="display" className="font-bold text-blue-600">
                          {formatCurrency(Number(course?.soTienHoc))}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Mã QR thanh toán */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <Text size="caption" className="font-semibold text-gray-700 block mb-4 text-center">
                      📱 Mã QR thanh toán
                    </Text>
                    <div className="flex justify-center">
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        {PAYMENT_CONFIG.qrCodeUrl && PAYMENT_CONFIG.qrCodeUrl !== "[URL mã QR hoặc base64]" ? (
                          <img 
                            src={PAYMENT_CONFIG.qrCodeUrl} 
                            alt="Mã QR thanh toán" 
                            className="w-64 h-64 rounded"
                          />
                        ) : (
                          <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded">
                            <Text size="caption" tone="muted" className="text-center">
                              📱 Mã QR<br/>Công ty
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                    <Text size="caption" tone="muted" className="mt-4 block text-center">
                      Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán
                    </Text>
                  </div>

                  {/* Hướng dẫn thanh toán */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Text size="caption" className="font-semibold text-gray-700 block mb-2">
                      ⚠️ Hướng dẫn thanh toán
                    </Text>
                    <ul className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      <li>Quét mã QR hoặc chuyển khoản theo thông tin dưới đây</li>
                      <li>Số tiền: <span className="font-semibold">{formatCurrency(Number(course?.soTienHoc))}</span></li>
                      <li>Nội dung chuyển khoản: Đặt lớp - {course?.tenKhoaHoc}</li>
                      <li>Sau khi thanh toán, đăng ký sẽ được xác nhận trong lịch sử</li>
                      <li>Liên hệ hỗ trợ nếu có bất kỳ vấn đề gì</li>
                    </ul>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="secondary"
                      onClick={() => setShowPaymentModal(false)}
                      disabled={submitting}
                      className="flex-1"
                    >
                      Quay lại
                    </Button>
                    <Button
                      onClick={handleConfirmPayment}
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? "Đang xử lý..." : "Tôi đã thanh toán"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
