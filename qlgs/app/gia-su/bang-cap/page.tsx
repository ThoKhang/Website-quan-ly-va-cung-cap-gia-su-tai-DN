// Đường dẫn: app/gia-su/bang-cap/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { giaSuService } from '@/services/gia-su.service';
import { Button, Card, Section, Text } from "@/component/ui";

export default function GiaSuBangCap() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    tenBangCap: '',
    thongTinBangCap: '',
    ngayCap: '',
    anhMinhChung: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const roleId = localStorage.getItem('loaiNguoiDungID');
    
    if (!token || roleId !== '2') {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tenBangCap || !formData.thongTinBangCap || !formData.ngayCap) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await giaSuService.addBangCap({
        tenBangCap: formData.tenBangCap,
        thongTinBangCap: formData.thongTinBangCap,
        ngayCap: formData.ngayCap,
        anhMinhChung: formData.anhMinhChung,
      });
      
      setSuccess('Thêm bằng cấp thành công!');
      setFormData({
        tenBangCap: '',
        thongTinBangCap: '',
        ngayCap: '',
        anhMinhChung: '',
      });
      
      setTimeout(() => {
        router.push('/gia-su');
      }, 2000);
    } catch (err) {
      console.error('Lỗi khi thêm bằng cấp:', err);
      setError('Không thể thêm bằng cấp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="page-shell">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(0,0,0,0.88)] text-white backdrop-blur-xl">
        <div className="content-lock flex items-center justify-between px-6 py-3 md:px-10">
          <Link href="/gia-su" className="text-blue-400 hover:text-blue-300">
            <Text as="span" size="caption" tone="onDark">
              ← Quay lại
            </Text>
          </Link>
          <Text as="h1" size="title" tone="onDark">
            Thêm Bằng Cấp
          </Text>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <Section>
        <div className="max-w-2xl mx-auto">
          <Card className="space-y-6 bg-white p-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <Text tone="muted" className="text-red-800">{error}</Text>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <Text tone="muted" className="text-green-800">{success}</Text>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tên Bằng Cấp */}
              <div>
                <Text as="label" size="caption" className="font-semibold block mb-2">
                  Tên Bằng Cấp <span className="text-red-600">*</span>
                </Text>
                <input
                  type="text"
                  name="tenBangCap"
                  value={formData.tenBangCap}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Cử nhân Sư phạm Toán"
                />
              </div>

              {/* Thông Tin Bằng Cấp */}
              <div>
                <Text as="label" size="caption" className="font-semibold block mb-2">
                  Thông Tin Bằng Cấp <span className="text-red-600">*</span>
                </Text>
                <textarea
                  name="thongTinBangCap"
                  value={formData.thongTinBangCap}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả chi tiết về bằng cấp"
                  rows={4}
                />
              </div>

              {/* Ngày Cấp */}
              <div>
                <Text as="label" size="caption" className="font-semibold block mb-2">
                  Ngày Cấp <span className="text-red-600">*</span>
                </Text>
                <input
                  type="date"
                  name="ngayCap"
                  value={formData.ngayCap}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Ảnh Minh Chứng */}
              <div>
                <Text as="label" size="caption" className="font-semibold block mb-2">
                  Ảnh Minh Chứng (Tùy Chọn)
                </Text>
                <input
                  type="text"
                  name="anhMinhChung"
                  value={formData.anhMinhChung}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="URL hoặc đường dẫn ảnh"
                />
                <Text size="fine" tone="muted" className="mt-2">
                  Bạn có thể cung cấp URL của ảnh bằng cấp hoặc chứng chỉ
                </Text>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Đang thêm...' : 'Thêm Bằng Cấp'}
                </Button>
                <Link href="/gia-su" className="flex-1">
                  <Button type="button" variant="secondary" className="w-full">
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
