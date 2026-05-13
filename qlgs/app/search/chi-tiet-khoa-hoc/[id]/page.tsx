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
          {/* Thông tin gia sư */}
          {tutor ? (
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
                    {tutor.tenGiaSu}
                  </Text>
                </div>
                <div>
                  <Text size="caption" tone="muted" className="mb-1">
                    Số khóa học đã dạy
                  </Text>
                  <Text size="body" className="font-semibold">
                    {tutor.soLuongKhoaHoc} khóa
                  </Text>
                </div>
                <div>
                  <Text size="caption" tone="muted" className="mb-1">
                    Đánh giá trung bình
                  </Text>
                  <Text size="body" className="font-semibold">
                    ⭐ {tutor.soSaoTrungBinh ?? 0}/5
                  </Text>
                </div>
                <div>
                  <Text size="caption" tone="muted" className="mb-1">
                    Số lượng đánh giá
                  </Text>
                  <Text size="body" className="font-semibold">
                    {tutor.soLuongDanhGia} đánh giá
                  </Text>
                </div>
              </div>

              {tutor.bangCap && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Text size="caption" tone="muted" className="mb-2">
                    Bằng cấp
                  </Text>
                  <Text size="body" className="font-semibold">
                    {tutor.bangCap.tenBangCap}
                  </Text>
                </div>
              )}

              {tutor.khoaHocs && tutor.khoaHocs.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Text size="caption" tone="muted" className="mb-3">
                    Các khóa học khác của gia sư
                  </Text>
                  <div className="space-y-2">
                    {tutor.khoaHocs.map((kh) => (
                      <div key={kh.idKhoaHoc} className="text-sm">
                        <Text size="body">{kh.tenKhoaHoc}</Text>
                        <Text size="caption" tone="muted">
                          {kh.tenMonHoc} - {kh.tenLop}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : course.tenGiaSu ? (
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
                    {course.tenGiaSu}
                  </Text>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Thông tin khóa học */}
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
                  {course.tenKhoaHoc}
                </Text>
              </div>
              <div>
                <Text size="caption" tone="muted" className="mb-1">
                  Môn học
                </Text>
                <Text size="body" className="font-semibold">
                  {course.tenMonHoc}
                </Text>
              </div>
              <div>
                <Text size="caption" tone="muted" className="mb-1">
                  Cấp lớp
                </Text>
                <Text size="body" className="font-semibold">
                  {course.tenLop}
                </Text>
              </div>
              <div>
                <Text size="caption" tone="muted" className="mb-1">
                  Số buổi học
                </Text>
                <Text size="body" className="font-semibold">
                  {course.soBuoiHoc} buổi
                </Text>
              </div>
              <div>
                <Text size="caption" tone="muted" className="mb-1">
                  Tổng tiền khóa học ({course.soBuoiHoc} buổi)
                </Text>
                <Text size="body" className="font-semibold text-blue-600">
                  {formatCurrency(course.soTienHoc)}
                </Text>
              </div>
              <div>
                <Text size="caption" tone="muted" className="mb-1">
                  Tiền / buổi
                </Text>
                <Text size="body" className="font-semibold text-gray-600">
                  {formatCurrency(course.soTienHoc / (course.soBuoiHoc || 1))}
                </Text>
              </div>
              <div>
                <Text size="caption" tone="muted" className="mb-1">
                  Đánh giá khóa học
                </Text>
                <Text size="body" className="font-semibold">
                  ⭐ {course.saoTrungBinh ?? 0}/5
                </Text>
              </div>
            </div>

            {course.moTa && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Text size="caption" tone="muted" className="mb-2">
                  Mô tả
                </Text>
                <Text size="body">{course.moTa}</Text>
              </div>
            )}

            {course.yeuCau && (
              <div className="mt-4">
                <Text size="caption" tone="muted" className="mb-2">
                  Yêu cầu
                </Text>
                <Text size="body">{course.yeuCau}</Text>
              </div>
            )}

            {isParent && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link href={`/hoc-vien/booking/${idKhoaHoc}`}>
                  <Button className="w-full">Đặt lớp này</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Lịch rảnh của gia sư */}
          {tutor && tutor.lichRanh && tutor.lichRanh.length > 0 && (
            <Card className="bg-white p-6 md:p-8">
              <Text as="h2" size="title" className="mb-6">
                Lịch Rảnh Của Gia Sư ({tutor.lichRanh.length} buổi)
              </Text>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Thứ
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Giờ bắt đầu
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Giờ kết thúc
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Số tiết
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutor.lichRanh.map((lich) => (
                      <tr key={lich.idLichDay} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{lich.tietHoc.thu}</td>
                        <td className="py-3 px-4">{lich.tietHoc.gioBatDau.substring(0, 5)}</td>
                        <td className="py-3 px-4">{lich.tietHoc.gioKetThuc.substring(0, 5)}</td>
                        <td className="py-3 px-4">{lich.tietHoc.soTiet} tiết</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              lich.tinhTrang
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {lich.tinhTrang ? "Rảnh" : "Bận"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
