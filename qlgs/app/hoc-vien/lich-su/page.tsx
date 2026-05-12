"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Text } from "@/component/ui";
import { hocVienService, type DangKyHocResponse } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";

export default function BookingHistoryPage() {
  const router = useRouter();
  const { isLoggedIn, idNguoiDung } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<DangKyHocResponse[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    fetchBookingHistory();
  }, [isLoggedIn, router, idNguoiDung]);

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
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải lịch sử");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      "Chưa bắt đầu": { bg: "bg-blue-100", text: "text-blue-700" },
      "Đang học": { bg: "bg-green-100", text: "text-green-700" },
      "Đã hoàn thành": { bg: "bg-gray-100", text: "text-gray-700" },
      "Đã nghỉ": { bg: "bg-yellow-100", text: "text-yellow-700" },
    };
    const style = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-700" };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
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

  return (
    <main className="page-shell">
      <div className="content-lock px-6 py-10 md:px-10">
        <div className="mb-8">
          <Text as="h1" size="display">
            Lịch Sử Khóa Học
          </Text>
          <Text size="lead" tone="muted" className="mt-2">
            Xem tất cả các khóa học bạn đã đăng ký
          </Text>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <Text size="body" className="text-red-700">
              {error}
            </Text>
          </div>
        )}

        {bookings.length === 0 ? (
          <Card className="bg-white p-8 text-center">
            <Text size="title" className="mb-2">
              Chưa có khóa học nào
            </Text>
            <Text tone="muted" className="mb-6">
              Hãy tìm kiếm và đăng ký khóa học để bắt đầu học tập
            </Text>
            <Link href="/search">
              <Button>Tìm khóa học</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.idDangKy} className="bg-white p-6 hover:shadow-lg transition">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Text size="caption" tone="muted" className="mb-1">
                      Khóa học
                    </Text>
                    <Text size="title">{booking.khoaHoc.tenKhoaHoc}</Text>
                  </div>
                  <div>
                    <Text size="caption" tone="muted" className="mb-1">
                      Gia sư
                    </Text>
                    <Text size="body">{booking.khoaHoc.tenGiaSu}</Text>
                  </div>
                  <div>
                    <Text size="caption" tone="muted" className="mb-1">
                      Giá tiền
                    </Text>
                    <Text size="body" className="font-semibold">
                      {formatCurrency(Number(booking.khoaHoc.soTienHoc))}
                    </Text>
                  </div>
                  <div>
                    <Text size="caption" tone="muted" className="mb-1">
                      Trạng thái
                    </Text>
                    {booking.chiTietLichHoc.length > 0 &&
                      getStatusBadge(booking.chiTietLichHoc[0].tinhTrang)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <Text size="caption" tone="muted">
                      Ngày đăng ký
                    </Text>
                    <Text size="body">{formatDate(booking.ngayDangKy)}</Text>
                  </div>
                  <div>
                    <Text size="caption" tone="muted">
                      Ngày bắt đầu
                    </Text>
                    <Text size="body">{formatDate(booking.ngayBatDauHoc)}</Text>
                  </div>
                  <div>
                    <Text size="caption" tone="muted">
                      Số buổi học
                    </Text>
                    <Text size="body">{booking.chiTietLichHoc.length} buổi</Text>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href={`/hoc-vien/chi-tiet/${booking.idDangKy}`}>
                    <Button variant="secondary" size="sm">
                      Xem chi tiết
                    </Button>
                  </Link>
                  {booking.trangThaiHoanThanh && !booking.chiTietLichHoc.some((c) => c.tinhTrang === "Đã đánh giá") && (
                    <Link href={`/hoc-vien/danh-gia/${booking.idDangKy}`}>
                      <Button size="sm">Đánh giá</Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
