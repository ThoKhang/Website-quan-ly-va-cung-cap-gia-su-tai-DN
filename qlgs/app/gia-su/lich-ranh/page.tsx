// Đường dẫn: app/gia-su/lich-ranh/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { giaSuService } from '@/services/gia-su.service';
import { Button, Card, Section, Text } from "@/component/ui";

interface LichRanhItem {
  idLichDay: string;
  tietHoc: {
    idTietHoc: string;
    thu: string;
    gioBatDau: string;
    gioKetThuc: string;
    soTiet: number;
  };
  tinhTrang: boolean;
}

interface EditingLichRanh {
  idTietHoc: string;
  thu: string;
  gioBatDau: string;
  gioKetThuc: string;
}

export default function GiaSuLichRanh() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [idGiaSu, setIdGiaSu] = useState('');
  const [lichRanhList, setLichRanhList] = useState<LichRanhItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // State cho modal chỉnh sửa
  const [editingLich, setEditingLich] = useState<EditingLichRanh | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    thu: '',
    gioBatDau: '',
    gioKetThuc: '',
  });

  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const roleId = localStorage.getItem('loaiNguoiDungID');
    const giaSuId = localStorage.getItem('idGiaSu');
    
    if (!token || roleId !== '2') {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      if (giaSuId) {
        setIdGiaSu(giaSuId);
        loadLichRanh(giaSuId);
      }
    }
  }, [router]);

  const loadLichRanh = async (giaSuId: string) => {
    setLoadingList(true);
    try {
      console.log('📥 Đang tải lịch rảnh cho gia sư:', giaSuId);
      const data = await giaSuService.getLichRanh(giaSuId);
      console.log('✅ Dữ liệu lịch rảnh nhận được:', data);
      console.log('📊 Số lịch rảnh:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('📋 Lịch rảnh đầu tiên:', JSON.stringify(data[0], null, 2));
      }
      setLichRanhList(data || []);
    } catch (err: any) {
      console.error('❌ Lỗi tải lịch rảnh:', err);
      console.error('❌ Error details:', err.response || err.message);
      setLichRanhList([]);
    } finally {
      setLoadingList(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Validate
    if (!formData.thu) {
      setMessage('Vui lòng chọn thứ');
      setMessageType('error');
      return;
    }
    if (!formData.gioBatDau) {
      setMessage('Vui lòng nhập giờ bắt đầu');
      setMessageType('error');
      return;
    }
    if (!formData.gioKetThuc) {
      setMessage('Vui lòng nhập giờ kết thúc');
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Bắt đầu tạo lịch rảnh với dữ liệu:', formData);
      
      // Step 1: Tạo TietHoc mới
      const tietHocData = {
        thu: formData.thu,
        gioBatDau: formData.gioBatDau,
        gioKetThuc: formData.gioKetThuc,
      };
      console.log('📤 Gửi TietHoc data:', JSON.stringify(tietHocData));
      
      const tietHocResponse = await giaSuService.createTietHoc(tietHocData);
      console.log('✅ TietHoc tạo thành công:', tietHocResponse);

      // Step 2: Đăng ký lịch rảnh với TietHoc vừa tạo
      const lichRanhResponse = await giaSuService.registerLichRanh({
        danhSachIdTietHoc: [tietHocResponse.idTietHoc],
      });
      console.log('✅ Lịch rảnh đăng ký thành công:', lichRanhResponse);

      setMessage('Đăng ký lịch rảnh thành công!');
      setMessageType('success');
      setShowForm(false);
      setFormData({ thu: '', gioBatDau: '', gioKetThuc: '' });
      
      // Reload lịch rảnh - sử dụng giaSuId từ localStorage
      const giaSuId = localStorage.getItem('idGiaSu');
      console.log('🔄 Đang reload lịch rảnh cho gia sư:', giaSuId);
      if (giaSuId) {
        // Thêm delay nhỏ để đảm bảo backend đã lưu xong
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadLichRanh(giaSuId);
      }
    } catch (err: any) {
      console.error('❌ Lỗi tạo lịch rảnh:', err);
      setMessageType('error');
      setMessage(err.message || 'Đăng ký lịch rảnh thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLichRanh = async (idLichDay: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa lịch rảnh này?')) {
      return;
    }

    try {
      await giaSuService.deleteLichRanh(idLichDay);
      setMessage('Xóa lịch rảnh thành công!');
      setMessageType('success');
      
      // Reload lịch rảnh
      if (idGiaSu) {
        await loadLichRanh(idGiaSu);
      }
    } catch (err: any) {
      setMessage(err.message || 'Xóa lịch rảnh thất bại!');
      setMessageType('error');
    }
  };

  const handleEditLichRanh = (lich: LichRanhItem) => {
    setEditingLich({
      idTietHoc: lich.tietHoc.idTietHoc,
      thu: lich.tietHoc.thu,
      gioBatDau: lich.tietHoc.gioBatDau,
      gioKetThuc: lich.tietHoc.gioKetThuc,
    });
    setShowEditModal(true);
  };

  const handleUpdateLichRanh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLich) return;

    setLoading(true);
    try {
      await giaSuService.updateTietHoc(editingLich.idTietHoc, {
        thu: editingLich.thu,
        gioBatDau: editingLich.gioBatDau,
        gioKetThuc: editingLich.gioKetThuc,
      });

      setMessage('Cập nhật lịch rảnh thành công!');
      setMessageType('success');
      setShowEditModal(false);
      setEditingLich(null);

      // Reload lịch rảnh
      if (idGiaSu) {
        await loadLichRanh(idGiaSu);
      }
    } catch (err: any) {
      setMessage(err.message || 'Cập nhật lịch rảnh thất bại!');
      setMessageType('error');
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
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="content-lock flex items-center justify-between px-6 py-4 md:px-10 gap-8">
          <Link href="/#gia-su-features" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <Text as="span" size="caption" className="font-medium whitespace-nowrap">
              Quay Lại
            </Text>
          </Link>
          <div className="flex-1 text-center min-w-0">
            <Text as="h1" size="display" className="text-gray-900 truncate">
              Lịch Rảnh
            </Text>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 flex-shrink-0 ${
              showForm
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">{showForm ? 'Hủy' : 'Thêm Lịch'}</span>
            <span className="sm:hidden">{showForm ? 'Hủy' : '+'}</span>
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

        {/* Form Thêm Lịch Rảnh */}
        {showForm && (
          <Card className="space-y-6 bg-white p-8 mb-8">
            <Text as="h2" size="title">
              Thêm Lịch Rảnh Mới
            </Text>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Chọn Thứ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chọn Thứ <span className="text-red-500">*</span>
                </label>
                <select
                  name="thu"
                  value={formData.thu}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Chọn thứ --</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Giờ bắt đầu */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giờ Bắt Đầu <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <input
                      type="time"
                      name="gioBatDau"
                      value={formData.gioBatDau}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {formData.gioBatDau && (
                    <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-700">
                      {formData.gioBatDau}
                    </div>
                  )}
                </div>
              </div>

              {/* Giờ kết thúc */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giờ Kết Thúc <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <input
                      type="time"
                      name="gioKetThuc"
                      value={formData.gioKetThuc}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {formData.gioKetThuc && (
                    <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-700">
                      {formData.gioKetThuc}
                    </div>
                  )}
                </div>
              </div>

              {/* Hiển thị số tiết tính toán */}
              {formData.gioBatDau && formData.gioKetThuc && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Text size="caption" className="font-semibold text-green-900">
                    ✓ Thời gian: {formData.gioBatDau} - {formData.gioKetThuc}
                  </Text>
                  <Text size="fine" tone="muted" className="text-green-800 mt-1">
                    Số tiết sẽ được tính tự động (55 phút = 1 tiết)
                  </Text>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Đang thêm...' : 'Thêm Lịch'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ thu: '', gioBatDau: '', gioKetThuc: '' });
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
          <Card className="bg-blue-50 border border-blue-200 p-6 mb-8">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
              <div>
                <Text as="p" size="caption" className="font-semibold text-blue-900">
                  Hướng dẫn
                </Text>
                <Text size="fine" className="text-blue-800 mt-1">
                  Chọn các khung giờ bạn rảnh để học viên có thể đặt lớp với bạn. Bạn có thể thêm, xóa lịch rảnh bất kỳ lúc nào.
                </Text>
              </div>
            </div>
          </Card>
        )}

        {/* Danh sách lịch rảnh */}
        <div>
          <Text as="h2" size="title" className="mb-6">
            Lịch Rảnh Của Bạn ({lichRanhList.length})
          </Text>

          {loadingList ? (
            <Card className="p-8 text-center">
              <Text tone="muted">Đang tải...</Text>
            </Card>
          ) : lichRanhList.length === 0 ? (
            <Card className="p-8 text-center bg-gray-50">
              <Text tone="muted">
                Bạn chưa đăng ký lịch rảnh nào. Hãy thêm lịch rảnh để học viên có thể đặt lớp với bạn.
              </Text>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lichRanhList.map(lich => (
                <Card key={lich.idLichDay} className="p-6 bg-white border border-gray-200 hover:border-blue-300 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Text as="p" size="caption" className="font-semibold text-gray-700">
                        {lich.tietHoc.thu}
                      </Text>
                      <Text as="p" size="body" className="font-bold text-gray-900 mt-1">
                        {lich.tietHoc.gioBatDau} - {lich.tietHoc.gioKetThuc}
                      </Text>
                    </div>
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Rảnh
                    </span>
                  </div>

                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <Text size="fine" tone="muted">
                      {lich.tietHoc.soTiet} tiết ({lich.tietHoc.soTiet * 55} phút)
                    </Text>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditLichRanh(lich)}
                      className="flex-1 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDeleteLichRanh(lich.idLichDay)}
                      className="flex-1 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Modal Chỉnh sửa lịch rảnh */}
      {showEditModal && editingLich && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white p-6">
            <Text as="h2" size="title" className="mb-6">
              Chỉnh Sửa Lịch Rảnh
            </Text>

            <form onSubmit={handleUpdateLichRanh} className="space-y-4">
              {/* Chọn Thứ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chọn Thứ <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingLich.thu}
                  onChange={(e) => setEditingLich({ ...editingLich, thu: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Giờ bắt đầu */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giờ Bắt Đầu <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <input
                      type="time"
                      value={editingLich.gioBatDau}
                      onChange={(e) => setEditingLich({ ...editingLich, gioBatDau: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {editingLich.gioBatDau && (
                    <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-700">
                      {editingLich.gioBatDau}
                    </div>
                  )}
                </div>
              </div>

              {/* Giờ kết thúc */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giờ Kết Thúc <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <input
                      type="time"
                      value={editingLich.gioKetThuc}
                      onChange={(e) => setEditingLich({ ...editingLich, gioKetThuc: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {editingLich.gioKetThuc && (
                    <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-700">
                      {editingLich.gioKetThuc}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Đang cập nhật...' : 'Cập Nhật'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingLich(null);
                  }}
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </main>
  );
}
