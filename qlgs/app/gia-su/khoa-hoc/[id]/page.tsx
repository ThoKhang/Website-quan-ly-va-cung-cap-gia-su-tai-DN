"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Section, Text } from "@/component/ui";
import { getCourseDetail } from "@/services/khoa-hoc.service";
import type { KhoaHoc } from "@/types/khoa-hoc.type";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<KhoaHoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await getCourseDetail(courseId);
      setCourse(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải chi tiết khóa học');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: number) => {
    switch (status) {
      case 1:
        return <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">Đã duyệt</span>;
      case 2:
        return <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">Từ chối</span>;
      default:
        return <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Chờ duyệt</span>;
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <Section>
          <div className="max-w-4xl mx-auto text-center py-12">
            <Text size="body" tone="muted">Đang tải...</Text>
          </div>
        </Section>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="page-shell">
        <Section>
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/gia-su/khoa-hoc">
                <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                  ← Quay Lại
                </Button>
              </Link>
            </div>
            <Card className="bg-red-50 border border-red-200 p-8 text-center">
              <Text size="body" className="text-red-800">{error || 'Không tìm thấy khóa học'}</Text>
            </Card>
          </div>
        </Section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <Section>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/gia-su/khoa-hoc">
              <Button className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800">
                ← Quay Lại
              </Button>
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <Text as="h1" size="hero" className="mb-2">{course.tenKhoaHoc}</Text>
                <div className="flex gap-4 items-center">
                  <Text size="lead" tone="muted">{course.tenGiaSu}</Text>
                  {getStatusBadge(course.trangThai)}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Left Column - Course Info */}
            <div className="col-span-2 space-y-6">
              {/* Thông tin cơ bản */}
              <Card className="bg-white p-6">
                <Text as="h2" size="display" className="mb-4">Thông Tin Cơ Bản</Text>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text size="caption" tone="muted" className="font-medium">Môn Học</Text>
                      <Text size="body" className="mt-1">{course.tenMonHoc}</Text>
                    </div>
                    <div>
                      <Text size="caption" tone="muted" className="font-medium">Cấp Lớp</Text>
                      <Text size="body" className="mt-1">{course.tenLop}</Text>
                    </div>
                    <div>
                      <Text size="caption" tone="muted" className="font-medium">Số Buổi Học</Text>
                      <Text size="body" className="mt-1">{course.soBuoiHoc} buổi</Text>
                    </div>
                    <div>
                      <Text size="caption" tone="muted" className="font-medium">Giá Tiền</Text>
                      <Text size="body" className="mt-1 text-blue-600 font-semibold">
                        {course.soTienHoc.toLocaleString('vi-VN')} VNĐ
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Mô tả */}
              <Card className="bg-white p-6">
                <Text as="h2" size="display" className="mb-4">Mô Tả Khóa Học</Text>
                <Text size="body" className="text-gray-700 whitespace-pre-wrap">
                  {course.moTa}
                </Text>
              </Card>

              {/* Yêu cầu */}
              {course.yeuCau && (
                <Card className="bg-white p-6">
                  <Text as="h2" size="display" className="mb-4">Yêu Cầu Đối Với Học Viên</Text>
                  <Text size="body" className="text-gray-700 whitespace-pre-wrap">
                    {course.yeuCau}
                  </Text>
                </Card>
              )}

              {/* Nội dung */}
              {course.noiDungKhoaHoc && (
                <Card className="bg-white p-6">
                  <Text as="h2" size="display" className="mb-4">Nội Dung Khóa Học</Text>
                  <Text size="body" className="text-gray-700 whitespace-pre-wrap">
                    {course.noiDungKhoaHoc}
                  </Text>
                </Card>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Thông tin gia sư */}
              <Card className="bg-white p-6">
                <Text as="h3" size="bodyStrong" className="mb-4">Gia Sư</Text>
                <div className="space-y-3">
                  <Text size="body">{course.tenGiaSu}</Text>
                  {course.saoTrungBinh && (
                    <div>
                      <Text size="caption" tone="muted">Đánh Giá</Text>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-400">★</span>
                        <Text size="body" className="font-semibold">
                          {course.saoTrungBinh.toFixed(1)}/5
                        </Text>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Trạng thái */}
              <Card className="bg-white p-6">
                <Text as="h3" size="bodyStrong" className="mb-4">Trạng Thái</Text>
                <div className="mb-4">
                  {getStatusBadge(course.trangThai)}
                </div>
                {course.trangThai === 0 && (
                  <Text size="caption" tone="muted" className="text-yellow-700">
                    Khóa học đang chờ duyệt từ admin
                  </Text>
                )}
                {course.trangThai === 2 && (
                  <Text size="caption" tone="muted" className="text-red-700">
                    Khóa học đã bị từ chối
                  </Text>
                )}
              </Card>

              {/* Ngày tạo */}
              {course.ngayTao && (
                <Card className="bg-white p-6">
                  <Text as="h3" size="bodyStrong" className="mb-2">Ngày Tạo</Text>
                  <Text size="body">
                    {new Date(course.ngayTao).toLocaleDateString('vi-VN')}
                  </Text>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Link href={`/gia-su/khoa-hoc/${course.idKhoaHoc}/edit`} className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Chỉnh Sửa
                  </Button>
                </Link>
                <Link href="/gia-su/khoa-hoc" className="block">
                  <Button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800">
                    Quay Lại Danh Sách
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
