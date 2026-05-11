// Đường dẫn: app/gia-su/khoa-hoc/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { giaSuService, mockMonHoc, mockDanhMucLop, mockTietHoc } from '@/services/gia-su.service';
import { Button, Card, Section, Text } from "@/component/ui";

export default function GiaSuKhoaHoc() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tenKhoaHoc: '',
    moTa: '',
    yeuCau: '',
    noiDungKhoaHoc: '',
    soTienHoc: '',
    soBuoiHoc: '',
    idMonHoc: '',
    idDanhMucLop: '',
    danhSachIdTietHocRanh: [] as string[],
  });
  const [selectedTietHoc, setSelectedTietHoc] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const roleId = localStorage.getItem('loaiNguoiDungID');
    
    if (!token || roleId !== '2') {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.tenKhoaHoc.trim()) {
      newErrors.tenKhoaHoc = 'Vui lòng nhập tên khóa học';
    }

    if (!formData.moTa.trim()) {
      newErrors.moTa = 'Vui lòng nhập mô tả';
    }

    if (!formData.soTienHoc || parseInt(formData.soTienHoc) <= 0) {
      newErrors.soTienHoc = 'Vui lòng nhập số tiền hợp lệ';
    }

    if (!formData.soBuoiHoc || parseInt(formData.soBuoiHoc) <= 0) {
      newErrors.soBuoiHoc = 'Vui lòng nhập số buổi hợp lệ';
    }

    if (!formData.idMonHoc) {
      newErrors.idMonHoc = 'Vui lòng chọn môn học';
    }

    if (!formData.idDanhMucLop) {
      newErrors.idDanhMucLop = 'Vui lòng chọn lớp';
    }

    if (selectedTietHoc.length === 0) {
      newErrors.tietHoc = 'Vui lòng chọn ít nhất 1 tiết học';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleTietHocToggle = (idTietHoc: string) => {
    setSelectedTietHoc(prev => {
      if (prev.includes(idTietHoc)) {
        return prev.filter(id => id !== idTietHoc);
      } else {
        return [...prev, idTietHoc];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const idGiaSu = localStorage.getItem('idNguoiDung') || '';
      
      await giaSuService.createKhoaHoc({
        tenKhoaHoc: formData.tenKhoaHoc,
        moTa: formData.moTa,
        yeuCau: formData.yeuCau,
        noiDungKhoaHoc: formData.noiDungKhoaHoc,
        soTienHoc: parseInt(formData.soTienHoc),
        soBuoiHoc: parseInt(formData.soBuoiHoc),
        idGiaSu: idGiaSu,
        idMonHoc: formData.idMonHoc,
        idDanhMucLop: formData.idDanhMucLop,
        danhSachIdTietHocRanh: selectedTietHoc,
      });

      setMessage('Tạo khóa học thành công! Vui lòng chờ Admin phê duyệt.');
      setMessageType('success');
      setShowForm(false);
      setFormData({
        tenKhoaHoc: '',
        moTa: '',
        yeuCau: '',
        noiDungKhoaHoc: '',
        soTienHoc: '',
        soBuoiHoc: '',
        idMonHoc: '',
        idDanhMucLop: '',
        danhSachIdTietHocRanh: [],
      });
      setSelectedTietHoc([]);
    } catch (err: any) {
      setMessageType('error');
      setMessage(err.message || 'Tạo khóa học thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // Group TietHoc by day
  const groupedByDay = mockTietHoc.reduce((acc, tiet) => {
    const day = tiet.thu;
    if (!acc[day]) acc[day] = [];
    acc[day].push(tiet);
    return acc;
  }, {} as Record<string, any[]>);

  const daysOrder = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

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
            Khóa Học
          </Text>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
              showForm
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {showForm ? 'Hủy' : '+ Tạo Khóa Học'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <Section>
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {messageType === 'success' ? (
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <Text tone="muted" className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message}
            </Text>
          </div>
        )}

        {/* Form Tạo Khóa Học */}
        {showForm && (
          <Card className="space-y-6 bg-white p-8 mb-8">
            <Text as="h2" size="title">
              Tạo Khóa Học Mới
            </Text>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tên Khóa Học */}
              <div>
                <Text as="label" size="caption" className="font-semibold block mb-2">
                  Tên Khóa Học <span className="text-red-600">*</span>
                </Text>
                <input
                  type="text"
                  name="tenKhoaHoc"
                  value={formData.tenKhoaHoc}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tenKhoaHoc ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="VD: Toán 10 - Cơ Bản"
                />
                {errors.tenKhoaHoc && (
                  <Text size="fine" className="mt-1 text-red-600">{errors.tenKhoaHoc}</Text>
                )}
              </div>

              {/* Mô Tả */}
              <div>
                <Text as="label" size="caption" className="font-semibold block mb-2">
                  Mô Tả <span className="text-red-600">*</span>
                </Text>
                <textarea
                  name="moTa"
                  value={formData.moTa}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.moTa ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Mô tả khóa học"
                  rows={3}
                />
                {errors.moTa && (
                  <Text size="fine" className="mt-1 text-red-600">{errors.moTa}</Text>
                )}
              </div>

              {/* Yêu Cầu */}
              <div>
                <Text as="label" size="caption" className="font-semibold block mb-2">
                  Yêu Cầu
                </Text>
                <textarea
                  name="yeuCau"
                  value={formData.yeuCau}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Yêu cầu đối với học viên"
                  rows={2}
                />
              </div>

              {/* Nội Dung Khóa Học */}
              <div>
                <Text as="label" size="caption" className="font-semibold block mb-2">
                  Nội Dung Khóa Học
                </Text>
                <textarea
                  name="noiDungKhoaHoc"
                  value={formData.noiDungKhoaHoc}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nội dung chi tiết của khóa học"
                  rows={3}
                />
              </div>

              {/* Grid: Số Tiền, Số Buổi, Môn Học, Lớp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text as="label" size="caption" className="font-semibold block mb-2">
                    Số Tiền Học (VND) <span className="text-red-600">*</span>
                  </Text>
                  <input
                    type="number"
                    name="soTienHoc"
                    value={formData.soTienHoc}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.soTienHoc ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="500000"
                  />
                  {errors.soTienHoc && (
                    <Text size="fine" className="mt-1 text-red-600">{errors.soTienHoc}</Text>
                  )}
                </div>

                <div>
                  <Text as="label" size="caption" className="font-semibold block mb-2">
                    Số Buổi Học <span className="text-red-600">*</span>
                  </Text>
                  <input
                    type="number"
                    name="soBuoiHoc"
                    value={formData.soBuoiHoc}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.soBuoiHoc ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="12"
                  />
                  {errors.soBuoiHoc && (
                    <Text size="fine" className="mt-1 text-red-600">{errors.soBuoiHoc}</Text>
                  )}
                </div>

                <div>
                  <Text as="label" size="caption" className="font-semibold block mb-2">
                    Môn Học <span className="text-red-600">*</span>
                  </Text>
                  <select
                    name="idMonHoc"
                    value={formData.idMonHoc}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.idMonHoc ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Chọn môn học --</option>
                    {mockMonHoc.map(mon => (
                      <option key={mon.idMonHoc} value={mon.idMonHoc}>
                        {mon.tenMonHoc}
                      </option>
                    ))}
                  </select>
                  {errors.idMonHoc && (
                    <Text size="fine" className="mt-1 text-red-600">{errors.idMonHoc}</Text>
                  )}
                </div>

                <div>
                  <Text as="label" size="caption" className="font-semibold block mb-2">
                    Lớp <span className="text-red-600">*</span>
                  </Text>
                  <select
                    name="idDanhMucLop"
                    value={formData.idDanhMucLop}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.idDanhMucLop ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Chọn lớp --</option>
                    {mockDanhMucLop.map(lop => (
                      <option key={lop.idDanhMucLop} value={lop.idDanhMucLop}>
                        {lop.tenLop}
                      </option>
                    ))}
                  </select>
                  {errors.idDanhMucLop && (
                    <Text size="fine" className="mt-1 text-red-600">{errors.idDanhMucLop}</Text>
                  )}
                </div>
              </div>

              {/* Chọn Tiết Học */}
              <div>
                <Text as="p" size="caption" className="font-semibold mb-4">
                  Chọn Tiết Học <span className="text-red-600">*</span>
                </Text>
                
                {daysOrder.map(day => (
                  groupedByDay[day] && (
                    <div key={day} className="mb-6">
                      <Text as="p" size="caption" className="font-semibold text-gray-700 mb-3">
                        {day}
                      </Text>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                        {groupedByDay[day].map(tiet => (
                          <label key={tiet.idTietHoc} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition">
                            <input
                              type="checkbox"
                              checked={selectedTietHoc.includes(tiet.idTietHoc)}
                              onChange={() => handleTietHocToggle(tiet.idTietHoc)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div>
                              <Text size="caption" className="font-medium">
                                {tiet.gioBatDau} - {tiet.gioKetThuc}
                              </Text>
                              <Text size="fine" tone="muted">
                                {tiet.soTiet} tiết
                              </Text>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                ))}
                
                {errors.tietHoc && (
                  <Text size="fine" className="mt-2 text-red-600">{errors.tietHoc}</Text>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Đang tạo...' : 'Tạo Khóa Học'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setShowForm(false);
                    setSelectedTietHoc([]);
                  }}
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Info */}
        {!showForm && (
          <Card className="bg-blue-50 border border-blue-200 p-6">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
              <div>
                <Text as="p" size="caption" className="font-semibold text-blue-900">
                  Hướng dẫn
                </Text>
                <Text size="fine" className="text-blue-800 mt-1">
                  Tạo khóa học của bạn với các thông tin chi tiết. Khóa học sẽ được gửi cho Admin phê duyệt trước khi hiển thị cho học viên.
                </Text>
              </div>
            </div>
          </Card>
        )}
      </Section>
    </main>
  );
}
