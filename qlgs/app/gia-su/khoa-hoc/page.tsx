"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Section, Text } from "@/component/ui";

export default function GiaSuKhoaHoc() {
  const [formData, setFormData] = useState({
    tenKhoaHoc: '',
    moTa: '',
    monHoc: '',
    capLop: '',
    giaTien: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tạo khóa học:', formData);
    alert('Khóa học đã được tạo thành công!');
  };

  return (
    <main className="page-shell">
      <Section>
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Text as="h1" size="hero" className="mb-2">Khóa Học</Text>
            <Text size="lead" tone="muted">
              Tạo và quản lý các khóa học của bạn
            </Text>
          </div>

          <Card className="bg-white p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khóa học
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả khóa học
                </label>
                <textarea
                  name="moTa"
                  value={formData.moTa}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết về khóa học"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Môn học
                  </label>
                  <select
                    name="monHoc"
                    value={formData.monHoc}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn môn học</option>
                    <option value="toan">Toán</option>
                    <option value="tieng-anh">Tiếng Anh</option>
                    <option value="ly">Lý</option>
                    <option value="hoa">Hóa</option>
                    <option value="sinh">Sinh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp lớp
                  </label>
                  <select
                    name="capLop"
                    value={formData.capLop}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn cấp lớp</option>
                    <option value="lop-10">Lớp 10</option>
                    <option value="lop-11">Lớp 11</option>
                    <option value="lop-12">Lớp 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá tiền (VNĐ)
                </label>
                <input
                  type="number"
                  name="giaTien"
                  value={formData.giaTien}
                  onChange={handleChange}
                  placeholder="Nhập giá tiền"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" size="lg">
                  Tạo khóa học
                </Button>
                <Link href="/">
                  <Button type="button" size="lg" variant="secondary">
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
