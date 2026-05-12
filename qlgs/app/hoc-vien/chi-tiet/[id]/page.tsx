"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, Text } from "@/component/ui";
import {
  hocVienService,
  type ChiTietLichHocResponse,
} from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schedules, setSchedules] = useState<ChiTietLichHocResponse[]>([]);

  const idDangKy = params.id as string;

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    fetchCourseDetail();
  }, [isLoggedIn, router, idDangKy]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const data = await hocVienService.getScheduleDetail(idDangKy);
      setSchedules(data);
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
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatCurrency = (value: any) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
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

  if (schedules.length === 0) {
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
              {error || "Không có dữ liệu lịch học"}
            </Text>
          </Card>
        </div>
      </main>
    );
  }

  const firstSchedule = schedules[0];
  const khoaHoc = (firstSchedule as any)?.khoaHoc;
  const giaSu = firstSchedule.lichDay.giaSu;

  return (
    <main className="page-shell">
      <div className="content-lock px-6 py-10 md:px-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Text as="h1" size="display">
              Chi Tiết Khóa Học
            </Text>
          </div>
          <Link href="/search">
            <Button variant="secondary">Quay lại</Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <Text size="body" className="text-red-700">
              {error}
            </Text>
          </div>
        )}

        <div className="space-y-6">
          {/* Thông tin khóa học */}
          {khoaHoc && (
            <Card className="bg-white p-6 md:p-8">
              <Text as="h2" size="title" className="mb-6">
                Thông Tin Khóa Học
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Text size="caption" tone="muted" className="mb-1">
                    Tên khóa học
                  </Text>
                  <Text size="body" className="font-semibold">
                    {khoaHoc.tenKhoaHoc}
                  </Text>
                </div>
                <div>
                  <Text size="caption" tone="muted" className="mb-1">
                    Môn học
                  </Text>
                  <Text size="body" className="font-semibold">
                    {khoaHoc.tenMonHoc}
                  </Text>
                </div>
                <div>
                  <Text size="caption" tone="muted" className="mb-1">
                    Cấp lớp
                  </Text>
                  <Text size="body" className="font-semibold">
                    {khoaHoc.tenLop}
                  </Text>
                </div>
                <div>
                  <Text size="caption" tone="muted" className="mb-1">
                    Số buổi học
                  </Text>
                  <Text size="body" className="font-semibold">
                    {khoaHoc.soBuoiHoc} buổi
                  </Text>
                </div>
                <div>
                  <Text size="caption" tone="muted" className="mb-1">
                    Tổng tiền khóa học
                  </Text>
                  <Text size="body" className="font-semibold text-blue-600">
                    {formatCurrency(khoaHoc.soTienHoc)}
                  </Text>
                </div>
                <div>
                  <Text size="caption" tone="muted" className="mb-1">
                    Tiền / buổi
                  </Text>
                  <Text size="body" className="font-semibold text-gray-600">
                    {formatCurrency(khoaHoc.soTienHoc / (khoaHoc.soBuoiHoc || 1))}
                  </Text>
                </div>
                <div>
                  <Text size="caption" tone="muted" className="mb-1">
                    Đánh giá khóa học
                  </Text>
                  <Text size="body" className="font-semibold">
                    ⭐ {khoaHoc.soSaoTrungBinh}/5 ({khoaHoc.soLuongDanhGia} đánh giá)
                  </Text>
                </div>
              </div>
              {khoaHoc.moTa && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Text size="caption" tone="muted" className="mb-2">
                    Mô tả
                  </Text>
                  <Text size="body">{khoaHoc.moTa}</Text>
                </div>
              )}
              {khoaHoc.yeuCau && (
                <div className="mt-4">
                  <Text size="caption" tone="muted" className="mb-2">
                    Yêu cầu
                  </Text>
                  <Text size="body">{khoaHoc.yeuCau}</Text>
                </div>
              )}
            </Card>
          )}

          {/* Thông tin gia sư */}
          <Card className="bg-white p-6 md:p-8">
            <Text as="h2" size="title" className="mb-6">
              Thông Tin Gia Sư
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Text size="caption" tone="muted" className="mb-1">
                  Tên gia sư
                </Text>
                <Text size="body" className="font-semibold">
                  {giaSu.tenGiaSu}
                </Text>
              </div>
              <div>
                <Text size="caption" tone="muted" className="mb-1">
                  Số khóa học đã dạy
                </Text>
                <Text size="body" className="font-semibold">
                  {giaSu.soLuongKhoaHoc ?? 0} khóa
                </Text>
              </div>
              <div>
                <Text size="caption" tone="muted" className="mb-1">
                  Đánh giá trung bình
                </Text>
                <Text size="body" className="font-semibold">
                  ⭐ {giaSu.saoTrungBinh ?? 0}/5
                </Text>
              </div>
              <div>
                <Text size="caption" tone="muted" className="mb-1">
                  Số lượng đánh giá
                </Text>
                <Text size="body" className="font-semibold">
                  {giaSu.soLuongDanhGia ?? 0} đánh giá
                </Text>
              </div>
            </div>
          </Card>

          {/* Lịch học chi tiết */}
          <Card className="bg-white p-6 md:p-8">
            <Text as="h2" size="title" className="mb-6">
              Lịch Học Chi Tiết ({schedules.length} buổi)
            </Text>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Buổi
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Ngày học
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Giờ học
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Thứ
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Trạng thái
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule, index) => (
                    <tr key={schedule.idLichHoc} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">Buổi {index + 1}</td>
                      <td className="py-3 px-4">{formatDate(schedule.ngayHoc)}</td>
                      <td className="py-3 px-4">
                        {formatTime(schedule.lichDay.tietHoc.gioBatDau)} -{" "}
                        {formatTime(schedule.lichDay.tietHoc.gioKetThuc)}
                      </td>
                      <td className="py-3 px-4">{schedule.lichDay.tietHoc.thu}</td>
                      <td className="py-3 px-4">{getStatusBadge(schedule.tinhTrang)}</td>
                      <td className="py-3 px-4">
                        {schedule.tinhTrang === "Chưa bắt đầu" && (
                          <Link href={`/hoc-vien/xin-nghi/${schedule.idLichHoc}`}>
                            <Button size="sm" variant="secondary">
                              Xin nghỉ
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
