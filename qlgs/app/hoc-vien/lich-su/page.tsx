"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Section } from "@/component/ui";
import { hocVienService, type DangKyHocResponse } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";

// Helper function to determine course status based on dates and progress
const getStatusFromDates = (
  booking: DangKyHocResponse
): "Chưa bắt đầu" | "Đang học" | "Đã hoàn thành" => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(booking.ngayBatDauHoc);
  startDate.setHours(0, 0, 0, 0);

  // Calculate end date based on number of sessions
  // Assuming sessions are typically weekly or based on schedule
  const chiTietLichHoc = booking.chiTietLichHoc || [];
  let endDate = startDate;
  
  if (chiTietLichHoc.length > 0) {
    // Get the last session date
    const lastSession = chiTietLichHoc[chiTietLichHoc.length - 1];
    endDate = new Date(lastSession.ngayHoc);
    endDate.setHours(0, 0, 0, 0);
  }

  const completedSessions = chiTietLichHoc.filter(
    (session) => session.tinhTrang === "Đã hoàn thành"
  ).length;
  const totalSessions = booking.khoaHoc.soBuoiHoc;

  // Status logic:
  // 1. If today < start date => "Chưa bắt đầu"
  // 2. If start date <= today <= end date => "Đang học"
  // 3. If today > end date AND completed all sessions => "Đã hoàn thành"
  // 4. If today > end date BUT not completed all sessions => "Đã hoàn thành" (course ended)

  if (today < startDate) {
    return "Chưa bắt đầu";
  } else if (today > endDate) {
    // Course period has ended
    return "Đã hoàn thành";
  } else {
    // Today is within the course period
    return "Đang học";
  }
};

// Helper function to get display status based on booking data
const getDisplayStatus = (booking: DangKyHocResponse): string => {
  // Ưu tiên hiển thị trạng thái gia hạn ở BẤT KỲ tab nào (kể cả tab Tất cả)
  if (booking.ngayGiaHan) {
    // Tạm thời hiển thị "Đang chờ duyệt".
    // Nếu BE có field duyệt, bạn có thể sửa: return booking.isApproved ? "Đã duyệt" : "Đang chờ duyệt";
    return "Đang chờ duyệt";
  }
  // Các trường hợp khác tính theo ngày
  return getStatusFromDates(booking);
};

export default function BookingHistoryPage() {
  const router = useRouter();
  const { isLoggedIn, idNguoiDung } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<DangKyHocResponse[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"warning" | "error" | "info">("info");

  const statusOptions = [
    { value: "all", label: "Tất cả", icon: "📚", color: "slate" },
    { value: "Chưa bắt đầu", label: "Chưa bắt đầu", icon: "⏳", color: "blue" },
    { value: "Đang học", label: "Đang học", icon: "📖", color: "green" },
    { value: "Đã hoàn thành", label: "Kết thúc", icon: "✅", color: "gray" },
    { value: "Gia hạn", label: "Gia hạn", icon: "🔄", color: "purple" },
  ];

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    fetchBookingHistory();
  }, [isLoggedIn, router, idNguoiDung]);

  // Refresh data when page regains focus (after returning from extension page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchBookingHistory();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [idNguoiDung]);

  const fetchBookingHistory = async () => {
    try {
      setLoading(true);
      if (!idNguoiDung) {
        setError("Không tìm thấy thông tin người dùng");
        return;
      }
      const data = await hocVienService.getBookingHistory(idNguoiDung);
      setBookings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Có lỗi xảy ra khi tải lịch sử");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: string; dot: string }> = {
      "Chưa bắt đầu": { bg: "bg-white", text: "text-black", icon: "⏳", dot: "bg-slate-400" },
      "Đang học": { bg: "bg-blue-50", text: "text-blue-600", icon: "📖", dot: "bg-blue-500" },
      "Đã hoàn thành": { bg: "bg-green-50", text: "text-green-600", icon: "✅", dot: "bg-green-500" },
      "Đã nghỉ": { bg: "bg-amber-50", text: "text-amber-700", icon: "⏸️", dot: "bg-amber-500" },
      "Đang chờ duyệt": { bg: "bg-yellow-50", text: "text-yellow-700", icon: "⏳", dot: "bg-yellow-500" },
    };
    const style = statusMap[status] || { bg: "bg-white", text: "text-black", icon: "•", dot: "bg-slate-400" };
    return (
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${style.bg} ${style.text}`}>
          {style.icon} {status}
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const getDaysRemaining = (booking: DangKyHocResponse): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = booking.ngayKetThucDuKien 
      ? new Date(booking.ngayKetThucDuKien)
      : new Date(booking.ngayBatDauHoc);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return daysLeft;
  };

  const handleExtendClick = (booking: DangKyHocResponse) => {
    const daysRemaining = getDaysRemaining(booking);
    
    // Nếu đã gia hạn rồi, chỉ cho phép cập nhật ngày học
    if (booking.ngayGiaHan) {
      router.push(`/hoc-vien/gia-han/${booking.idDangKy}`);
      return;
    }
    
    if (daysRemaining > 15) {
      setModalType("warning");
      setModalMessage(`Chỉ có thể gia hạn trong 15 ngày trước khi kết thúc khóa học.\n\nHiện tại khóa học còn ${daysRemaining} ngày. Vui lòng quay lại sau.`);
      setShowModal(true);
      return;
    }
    
    if (daysRemaining <= 0) {
      setModalType("error");
      setModalMessage("Khóa học đã kết thúc. Không thể gia hạn.");
      setShowModal(true);
      return;
    }
    
    // Nếu hợp lệ, điều hướng đến trang gia hạn
    router.push(`/hoc-vien/gia-han/${booking.idDangKy}`);
  };

  const getFilteredBookings = () => {
    // BƯỚC 1: Xử lý triệt để việc trùng lặp (1 khóa học chỉ lấy 1 card)
    const uniqueBookingsMap = new Map<string, DangKyHocResponse>();
    bookings.forEach((booking) => {
      // Dùng idKhoaHoc (hoặc tenKhoaHoc) làm "chìa khóa" để nhận diện
      const courseKey = booking.khoaHoc.idKhoaHoc || booking.khoaHoc.tenKhoaHoc;
      if (!uniqueBookingsMap.has(courseKey)) {
        // Nếu chưa có, đưa vào danh sách
        uniqueBookingsMap.set(courseKey, booking);
      } else {
        // Nếu đã có khóa học này rồi, ưu tiên giữ lại bản ghi CÓ ngayGiaHan
        if (booking.ngayGiaHan) {
          uniqueBookingsMap.set(courseKey, booking);
        }
      }
    });

    // Chuyển Map thành mảng sau khi đã khử trùng lặp xong
    const uniqueBookings = Array.from(uniqueBookingsMap.values());

    // BƯỚC 2: Bắt đầu chia về các Tab
    if (selectedStatus === "all") {
      return uniqueBookings;
    }
    if (selectedStatus === "Gia hạn") {
      return uniqueBookings.filter(booking => booking.ngayGiaHan);
    }
    if (selectedStatus === "Chưa bắt đầu") {
      return uniqueBookings.filter(booking => {
        return getStatusFromDates(booking) === "Chưa bắt đầu" && !booking.ngayGiaHan;
      });
    }
    // Các tab còn lại (Đang học, Đã hoàn thành) - hiển thị tất cả khóa học với trạng thái đó, kể cả đã gia hạn
    return uniqueBookings.filter(booking => {
      return getStatusFromDates(booking) === selectedStatus;
    });
  };

  const filteredBookings = getFilteredBookings();
  const stats = {
    total: bookings.length,
    notStarted: bookings.filter(b => getStatusFromDates(b) === "Chưa bắt đầu").length,
    active: bookings.filter(b => getStatusFromDates(b) === "Đang học").length,
    completed: bookings.filter(b => getStatusFromDates(b) === "Đã hoàn thành").length,
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pb-16 pt-8">
        <Section>
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded-lg w-48 mx-auto mb-4" />
              <div className="h-4 bg-slate-200 rounded-lg w-96 mx-auto" />
            </div>
          </div>
        </Section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16 pt-8">
      <Section>
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-8 py-10 text-white shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                📚
              </div>
              <div>
                <h1 className="text-3xl font-bold">Lịch Sử Khóa Học</h1>
                <p className="text-blue-100 text-sm mt-1">Theo dõi tất cả các khóa học bạn đã đăng ký</p>
              </div>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-800 animate-in slide-in-from-top duration-300">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* STATS CARDS */}
          {bookings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Tổng khóa học", value: stats.total, icon: "📚", color: "blue" },
                { label: "Chưa bắt đầu", value: stats.notStarted, icon: "⏳", color: "slate" },
                { label: "Đang học", value: stats.active, icon: "📖", color: "green" },
                { label: "Hoàn thành", value: stats.completed, icon: "✅", color: "slate" },
              ].map((stat, i) => (
                <div key={i} className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-${stat.color}-50`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FILTER BUTTONS */}
          {bookings.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200 justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {statusOptions.slice(0, 4).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                      selectedStatus === option.value
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <span>{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
              
              {/* Tab Gia hạn - bên phải */}
              <button
                onClick={() => setSelectedStatus("Gia hạn")}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedStatus === "Gia hạn"
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <span>🔄</span>
                Gia hạn
              </button>
            </div>
          )}

          {/* CONTENT */}
          {bookings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                📚
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Chưa có khóa học nào</h2>
              <p className="text-slate-500 mb-6">Hãy tìm kiếm và đăng ký khóa học để bắt đầu hành trình học tập của bạn</p>
              <Link href="/search">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3">
                  🔍 Tìm khóa học
                </Button>
              </Link>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🔍
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy khóa học</h2>
              <p className="text-slate-500">Không có khóa học nào với trạng thái "{statusOptions.find(o => o.value === selectedStatus)?.label}"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking, idx) => {
                const status = getStatusFromDates(booking);
                const displayStatus = getDisplayStatus(booking);
                const progressPercent = Math.round((booking.chiTietLichHoc.filter((c: any) => c.tinhTrang === "Đã hoàn thành").length / booking.khoaHoc.soBuoiHoc) * 100);
                
                // Xác định màu background dựa trên trạng thái
                let bgColor = "bg-white";
                let borderColor = "border-slate-200";
                let statusBgColor = "bg-white";
                let statusBorderColor = "border-slate-200";
                
                if (status === "Chưa bắt đầu") {
                  bgColor = "bg-white";
                  borderColor = "border-slate-200";
                  statusBgColor = "bg-white";
                  statusBorderColor = "border-slate-200";
                } else if (status === "Đang học") {
                  bgColor = "bg-blue-50";
                  borderColor = "border-blue-200";
                  statusBgColor = "bg-blue-50";
                  statusBorderColor = "border-blue-200";
                } else if (status === "Đã hoàn thành") {
                  bgColor = "bg-green-50";
                  borderColor = "border-green-200";
                  statusBgColor = "bg-green-50";
                  statusBorderColor = "border-green-200";
                }
                
                return (
                  <div
                    key={booking.idDangKy}
                    className={`${bgColor} ${borderColor} border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* TOP SECTION - Course Info */}
                    <div className="p-6 border-b border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{booking.khoaHoc.tenKhoaHoc}</h3>
                          <p className="text-sm text-slate-500 flex items-center gap-2">
                            <span>👨‍🏫</span>
                            Giảng viên: <span className="font-semibold text-slate-700">{booking.khoaHoc.tenGiaSu}</span>
                          </p>
                        </div>
                        <div className="flex items-start justify-between md:justify-end gap-4">
                          <div className="text-right">
                            <p className="text-sm text-slate-500 mb-1">Học phí</p>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(Number(booking.khoaHoc.soTienHoc))}</p>
                            <p className="text-xs text-slate-400 mt-1">({booking.khoaHoc.soBuoiHoc} buổi)</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className={`${statusBgColor} ${statusBorderColor} border rounded-full px-4 py-2`}>
                              {getStatusBadge(status)}
                            </div>
                            {booking.ngayGiaHan && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2">
                                {getStatusBadge("Đang chờ duyệt")}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MIDDLE SECTION - Timeline & Progress */}
                    <div className={`px-6 py-5 ${statusBgColor} border-b ${statusBorderColor}`}>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500 font-semibold mb-1">📅 Ngày đăng ký</p>
                          <p className="text-sm font-medium text-slate-800">{formatDate(booking.ngayDangKy)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-semibold mb-1">🚀 Ngày bắt đầu</p>
                          <p className="text-sm font-medium text-slate-800">{formatDate(booking.ngayBatDauHoc)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-semibold mb-1">📊 Tiến độ</p>
                          <p className="text-sm font-medium text-slate-800">{booking.chiTietLichHoc.length}/{booking.khoaHoc.soBuoiHoc} buổi</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-semibold mb-1">⏱️ Hoàn thành</p>
                          <p className="text-sm font-medium text-slate-800">{progressPercent}%</p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* BOTTOM SECTION - Actions */}
                    <div className="px-6 py-4 flex flex-wrap gap-3 justify-between items-center">
                      {selectedStatus !== "Gia hạn" && (
                        <Link href={`/hoc-vien/chi-tiet/${booking.idDangKy}`}>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-all">
                            👁️ Xem chi tiết
                          </Button>
                        </Link>
                      )}
                      
                      {/* Right side buttons */}
                      <div className="flex flex-wrap gap-3">
                        {status === "Đang học" && !booking.ngayGiaHan && (
                          <button
                            onClick={() => handleExtendClick(booking)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2.5 rounded-lg transition-all"
                          >
                            📅 Gia hạn khóa học
                          </button>
                        )}
                        {booking.trangThaiHoanThanh && !booking.chiTietLichHoc.some((c: any) => c.tinhTrang === "Đã đánh giá") && (
                          <Link href={`/hoc-vien/danh-gia/${booking.idDangKy}`}>
                            <Button className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-5 py-2.5 rounded-lg transition-all">
                              ⭐ Đánh giá khóa học
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Section>

      {/* MODAL THÔNG BÁO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className={`px-6 py-4 ${
              modalType === "warning" ? "bg-amber-50 border-b border-amber-200" :
              modalType === "error" ? "bg-red-50 border-b border-red-200" :
              "bg-blue-50 border-b border-blue-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                  modalType === "warning" ? "bg-amber-100" :
                  modalType === "error" ? "bg-red-100" :
                  "bg-blue-100"
                }`}>
                  {modalType === "warning" ? "⚠️" : modalType === "error" ? "❌" : "ℹ️"}
                </div>
                <h3 className={`text-lg font-bold ${
                  modalType === "warning" ? "text-amber-900" :
                  modalType === "error" ? "text-red-900" :
                  "text-blue-900"
                }`}>
                  {modalType === "warning" ? "Chưa đến thời gian gia hạn" :
                   modalType === "error" ? "Không thể gia hạn" :
                   "Thông báo"}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className={`text-sm leading-relaxed whitespace-pre-line ${
                modalType === "warning" ? "text-amber-800" :
                modalType === "error" ? "text-red-800" :
                "text-blue-800"
              }`}>
                {modalMessage}
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  modalType === "warning" ? "bg-amber-600 hover:bg-amber-700 text-white" :
                  modalType === "error" ? "bg-red-600 hover:bg-red-700 text-white" :
                  "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
