"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Section, Text } from "@/component/ui";
import { 
  getCourseDetail, 
  updateCourse,
  getSubjects,
  getClassLevels
} from "@/services/khoa-hoc.service";
import type { KhoaHoc, KhoaHocRequestDTO } from "@/types/khoa-hoc.type";
import type { SubjectOption, ClassLevelOption } from "@/types/search.type";

interface FormData extends Omit<KhoaHocRequestDTO, 'danhSachIdTietHocRanh'> {
  danhSachIdTietHocRanh: string;
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<KhoaHoc | null>(null);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    tenKhoaHoc: '',
    moTa: '',
    yeuCau: '',
    noiDungKhoaHoc: '',
    soTienHoc: 0,
    soBuoiHoc: 0,
    idGiaSu: '',
    idMonHoc: '',
    idDanhMucLop: '',
    danhSachIdTietHocRanh: '',
  });

  useEffect(() => {
    loadInitialData();
  }, [courseId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [courseRes, subjectsRes, classLevelsRes] = await Promise.all([
        getCourseDetail(courseId),
        getSubjects(),
        getClassLevels(),
      ]);

      setCourse(courseRes.data);
      setSubjects(subjectsRes.data);
      setClassLevels(classLevelsRes.data);

      // Populate form
      const courseData = courseRes.data;
      setFormData({
        tenKhoaHoc: courseData.tenKhoaHoc,
        moTa: courseData.moTa,
        yeuCau: courseData.yeuCau || '',
        noiDungKhoaHoc: courseData.noiDungKhoaHoc || '',
        soTienHoc: courseData.soTienHoc,
        soBuoiHoc: courseData.soBuoiHoc,
        idGiaSu: '',
        idMonHoc: '',
        idDanhMucLop: '',
        danhSachIdTietHocRanh: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'soTienHoc' || name === 'soBuoiHoc' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setSaving(true);

      const submitData: Partial<KhoaHocRequestDTO> = {
        tenKhoaHoc: formData.tenKhoaHoc,
        moTa: formData.moTa,
        yeuCau: formData.yeuCau,
        noiDungKhoaHoc: formData.noiDungKhoaHoc,
        soTienHoc: formData.soTienHoc,
        soBuoiHoc: formData.soBuoiHoc,
      };

      if (formData.danhSachIdTietHocRanh) {
        submitData.danhSachIdTietHocRanh = formData.danhSachIdTietHocRanh
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }

      await updateCourse(courseId, submitData);
      setSuccess('Cập nhật khóa học thành công!');
      
      setTimeout(() => {
        router.push(`/gia-su/khoa-hoc/${courseId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật khóa học');
      console.error(err);
    } finally {
      setSaving(false);
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

  if (error && !course) {
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
              <Text size="body" className="text-red-800">{error}</Text>
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
            <Link href={`/gia-su/khoa-hoc/${courseId}`}>
              <Button className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800">
                ← Quay Lại
              </Button>
            </Link>
            <Text as="h1" size="hero" className="mb-2">Chỉnh Sửa Khóa Học</Text>
            <Text size="lead" tone="muted">
              Cập nhật thông tin khóa học: {course?.tenKhoaHoc}
            </Text>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <Text size="body" className="text-red-800">{error}</Text>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Text size="body" className="text-green-800">{success}</Text>
            </div>
          )}

          {/* Form */}
          <Card className="bg-white p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tên khóa học */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tenKhoaHoc"
                  value={formData.tenKhoaHoc}
                  onChange={handleChange}
                  placeholder="Ví dụ: Toán 12 Cơ Bản"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả khóa học <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="moTa"
                  value={formData.moTa}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết về khóa học"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              {/* Yêu cầu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yêu cầu đối với học viên
                </label>
                <textarea
                  name="yeuCau"
                  value={formData.yeuCau}
                  onChange={handleChange}
                  placeholder="Các yêu cầu cần thiết"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              {/* Nội dung khóa học */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung khóa học
                </label>
                <textarea
                  name="noiDungKhoaHoc"
                  value={formData.noiDungKhoaHoc}
                  onChange={handleChange}
                  placeholder="Chi tiết nội dung sẽ học"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Grid: Giá tiền, Số buổi */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá tiền (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="soTienHoc"
                    value={formData.soTienHoc}
                    onChange={handleChange}
                    placeholder="Nhập giá tiền"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số buổi học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="soBuoiHoc"
                    value={formData.soBuoiHoc}
                    onChange={handleChange}
                    placeholder="Số buổi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                  />
                </div>
              </div>

              {/* Tiết học rảnh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiết học rảnh (cách nhau bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  name="danhSachIdTietHocRanh"
                  value={formData.danhSachIdTietHocRanh}
                  onChange={handleChange}
                  placeholder="Ví dụ: T2_Ca1, T4_Ca2, T6_Ca3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Text size="caption" tone="muted" className="mt-1">
                  Chọn các tiết học từ lịch rảnh của bạn
                </Text>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? 'Đang cập nhật...' : 'Cập Nhật Khóa Học'}
                </Button>
                <Link href={`/gia-su/khoa-hoc/${courseId}`} className="flex-1">
                  <Button 
                    type="button"
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
                  >
                    Hủy
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </Section>
    </main>
  );
}
