"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Section } from "@/component/ui";
import {
  hocVienService,
  type ChiTietLichHocResponse,
} from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn, idNguoiDung } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schedules, setSchedules] = useState<ChiTietLichHocResponse[]>([]);
  const [bookingInfo, setBookingInfo] = useState<any>(null);

  const idDangKy = params.id as string;

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    fetchCourseDetail();
  }, [isLoggedIn, router, idDangKy, idNguoiDung]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      if (!idNguoiDung) {
        setError("Không tìm thấy thông tin người dùng");
        return;
      }

      // Lấy chi tiết khóa học đã đăng ký (bao gồm cả khi chưa có lịch học)
      const courseDetail = await hocVienService.getCourseDetailById(idDangKy);
      
      if (courseDetail) {
        setBookingInfo(courseDetail);
        // Lấy chi tiết lịch học (có thể rỗng nếu chưa bắt đầu)
        try {
          const scheduleData = await hocVienService.getScheduleDetail(idDangKy);
          setSchedules(scheduleData);
        } catch (scheduleErr) {
          // Nếu không có lịch học, vẫn hiển thị thông tin khóa học
          console.log("Không có lịch học chi tiết");
          setSchedules([]);
        }
      } else {
        setError("Không tìm thấy thông tin khóa học");
      }
    } catch (err: any) {
      console.error("Error fetching course detail:", err);
      if (err.status === 403 || err.status === 401) {
        setError("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(err.message || err.response?.data?.message || "Có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: string }> = {
      "Chưa bắt đầu": { bg: "bg-white", text: "text-black", icon: "⏳" },
      "Đang học": { bg: "bg-blue-50", text: "text-blue-600", icon: "📖" },
      "Đã hoàn thành": { bg: "bg-green-50", text: "text-green-600", icon: "✅" },
      "Đã nghỉ": { bg: "bg-amber-50", text: "text-amber-600", icon: "⏸️" },
    };
    const style = statusMap[status] || { bg: "bg-white", text: "text-black", icon: "•" };
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${style.bg} ${style.text}`}>
        <span>{style.icon}</span>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  if (schedules.length === 0 && !bookingInfo) {
    return (
      <main className="min-h-screen bg-slate-50 pb-16 pt-8">
        <Section>
          <div className="max-w-6xl mx-auto px-4">
            <Link href="/hoc-vien/lich-su">
              <Button className="mb-6 bg-slate-600 hover:bg-slate-700 text-white font-medium px-4 py-2.5 rounded-lg">
                ← Quay lại lịch sử
              </Button>
            </Link>
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ⚠️
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Không có dữ liệu</h2>
              <p className="text-slate-500">{error || "Không tìm thấy lịch học cho khóa học này"}</p>
            </div>
          </div>
        </Section>
      </main>
    );
  }

  const khoaHoc = bookingInfo?.khoaHoc;
  const giaSu = schedules.length > 0 ? schedules[0].lichDay.giaSu : khoaHoc?.giaSu;

  return (
    <main className="min-h-screen bg-slate-50 pb-16 pt-8">
      <Section>
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Chi Tiết Khóa Học</h1>
              <p className="text-slate-500 mt-1">Xem thông tin chi tiết và lịch học</p>
            </div>
            <Link href="/hoc-vien/lich-su">
              <Button className="bg-slate-600 hover:bg-slate-700 text-white font-medium px-4 py-2.5 rounded-lg">
                ← Quay lại lịch sử
              </Button>
            </Link>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* COURSE INFO CARD */}
          {khoaHoc && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">📚 Thông Tin Khóa Học</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-slate-500 font-medium mb-1">Tên khóa học</p>
                  <p className="text-lg font-semibold text-slate-900">{khoaHoc.tenKhoaHoc}</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="text-sm text-slate-500 font-medium mb-1">Môn học</p>
                  <p className="text-lg font-semibold text-slate-900">{khoaHoc.tenMonHoc}</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm text-slate-500 font-medium mb-1">Cấp lớp</p>
                  <p className="text-lg font-semibold text-slate-900">{khoaHoc.tenLop}</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <p className="text-sm text-slate-500 font-medium mb-1">Số buổi học</p>
                  <p className="text-lg font-semibold text-slate-900">{khoaHoc.soBuoiHoc} buổi</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="text-sm text-slate-500 font-medium mb-1">Tổng tiền khóa học</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(khoaHoc.soTienHoc))}
                  </p>
                </div>
                <div className="border-l-4 border-indigo-500 pl-4">
                  <p className="text-sm text-slate-500 font-medium mb-1">Tiền / buổi</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(khoaHoc.soTienHoc) / (khoaHoc.soBuoiHoc || 1))}
                  </p>
                </div>
              </div>
              {khoaHoc.moTa && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-500 font-medium mb-2">Mô tả</p>
                  <p className="text-slate-700">{khoaHoc.moTa}</p>
                </div>
              )}
              {khoaHoc.yeuCau && (
                <div className="mt-4">
                  <p className="text-sm text-slate-500 font-medium mb-2">Yêu cầu</p>
                  <p className="text-slate-700">{khoaHoc.yeuCau}</p>
                </div>
              )}
            </div>
          )}

          {/* TUTOR INFO CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">👨‍🏫 Thông Tin Gia Sư</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <p className="text-sm text-slate-600 font-medium mb-2">Tên gia sư</p>
                <p className="text-lg font-semibold text-slate-900">{giaSu.tenGiaSu}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <p className="text-sm text-slate-600 font-medium mb-2">Số khóa học đã dạy</p>
                <p className="text-lg font-semibold text-slate-900">{giaSu.soLuongKhoaHoc ?? 0} khóa</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
                <p className="text-sm text-slate-600 font-medium mb-2">Đánh giá trung bình</p>
                <p className="text-lg font-semibold text-slate-900">⭐ {giaSu.saoTrungBinh ?? 0}/5</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <p className="text-sm text-slate-600 font-medium mb-2">Số lượng đánh giá</p>
                <p className="text-lg font-semibold text-slate-900">{giaSu.soLuongDanhGia ?? 0} đánh giá</p>
              </div>
            </div>
          </div>

          {/* SCHEDULE TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">📅 Lịch Học Chi Tiết ({schedules.length} buổi)</h2>
            {schedules.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-lg">⏳ Khóa học chưa bắt đầu, lịch học sẽ được cập nhật sau</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-50">
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Buổi</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Ngày học</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Giờ học</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Thứ</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Trạng thái</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule, index) => (
                      <tr key={schedule.idLichHoc} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-900">Buổi {index + 1}</td>
                        <td className="py-4 px-4 text-slate-700">
                          {new Date(schedule.ngayHoc).toLocaleDateString("vi-VN", {
                            weekday: "short",
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </td>
                        <td className="py-4 px-4 text-slate-700">
                          {schedule.lichDay.tietHoc.gioBatDau.substring(0, 5)} - {schedule.lichDay.tietHoc.gioKetThuc.substring(0, 5)}
                        </td>
                        <td className="py-4 px-4 text-slate-700">{schedule.lichDay.tietHoc.thu}</td>
                        <td className="py-4 px-4">{getStatusBadge(schedule.tinhTrang)}</td>
                        <td className="py-4 px-4">
                          {schedule.tinhTrang === "Chưa bắt đầu" && index > 0 && (
                            <Link href={`/hoc-vien/xin-nghi/${schedule.idLichHoc}`}>
                              <Button className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-lg text-sm">
                                ⏸️ Xin nghỉ
                              </Button>
                            </Link>
                          )}
                          {index === 0 && (
                            <span className="text-slate-400 text-sm"></span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Section>
    </main>
  );
}
