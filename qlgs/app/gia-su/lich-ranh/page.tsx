"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { giaSuService } from '@/services/gia-su.service';
import { Button, Card, Section, Text } from "@/component/ui";

interface TietHoc {
  idTietHoc: string;
  thu: string;
  gioBatDau: string;
  gioKetThuc: string;
  soTiet: number;
}

interface LichRanhItem {
  idLichDay: string;
  tietHoc: TietHoc;
  tinhTrang: boolean;
}

export default function GiaSuLichRanh() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [idGiaSu, setIdGiaSu] = useState('');
  const [lichRanhList, setLichRanhList] = useState<LichRanhItem[]>([]);
  
  // STATE MỚI: Danh sách toàn bộ tiết học từ hệ thống
  const [systemTietHoc, setSystemTietHoc] = useState<TietHoc[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // Form state: Chỉ lưu thứ và idTietHoc
  const [formData, setFormData] = useState({
    thu: '',
    idTietHoc: '',
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
        loadSystemTietHoc(); // Load danh sách ca học hệ thống
      }
    }
  }, [router]);

  // HÀM MỚI: Load danh sách Tiết học gốc
  const loadSystemTietHoc = async () => {
    try {
      // Gọi API lấy toàn bộ TietHoc (Bạn cần đảm bảo hàm này có trong giaSuService)
      const data = await giaSuService.getAllTietHoc();
      setSystemTietHoc(data || []);
    } catch (err) {
      console.error('❌ Lỗi tải danh sách tiết học hệ thống:', err);
    }
  };

  const loadLichRanh = async (giaSuId: string) => {
    setLoadingList(true);
    try {
      const data = await giaSuService.getLichRanh(giaSuId);
      setLichRanhList(data || []);
    } catch (err: any) {
      setLichRanhList([]);
    } finally {
      setLoadingList(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Nếu đổi Thứ, tự động reset idTietHoc đã chọn
      if (name === 'thu') {
        return { thu: value, idTietHoc: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  // Hàm tiện ích cắt giờ (Vì DATETIME từ SQL Server có thể dư ngày tháng)
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    if (timeStr.includes('T')) return timeStr.split('T')[1].substring(0, 5); // Cắt lấy HH:mm
    return timeStr.substring(0, 5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!formData.thu || !formData.idTietHoc) {
      setMessage('Vui lòng chọn Thứ và Ca học tương ứng!');
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      // Không cần tạo TietHoc nữa, trực tiếp đăng ký lịch rảnh với ID đã chọn
      await giaSuService.registerLichRanh({
        danhSachIdTietHoc: [formData.idTietHoc],
      });

      setMessage('Đăng ký lịch rảnh thành công!');
      setMessageType('success');
      setShowForm(false);
      setFormData({ thu: '', idTietHoc: '' });
      
      const giaSuId = localStorage.getItem('idGiaSu');
      if (giaSuId) {
        await loadLichRanh(giaSuId);
      }
    } catch (err: any) {
      setMessageType('error');
      setMessage(err.message || 'Đăng ký lịch rảnh thất bại! Có thể bạn đã đăng ký ca này rồi.');
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
      
      if (idGiaSu) {
        await loadLichRanh(idGiaSu);
      }
    } catch (err: any) {
      setMessage(err.message || 'Xóa lịch rảnh thất bại!');
      setMessageType('error');
    }
  };

  if (!isAuthenticated) return null;

  // Lọc ra các Tiết học theo Thứ đã chọn để hiển thị vào Dropdown
  const availableTietHoc = systemTietHoc.filter(t => t.thu === formData.thu);

  return (
    <main className="page-shell">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="content-lock flex items-center justify-between px-6 py-4 md:px-10 gap-8">
          <Link href="/#gia-su-features" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <Text as="span" size="caption" className="font-medium whitespace-nowrap">Quay Lại</Text>
          </Link>
          <div className="flex-1 text-center min-w-0">
            <Text as="h1" size="display" className="text-gray-900 truncate">Lịch Rảnh</Text>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 flex-shrink-0 ${
              showForm ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'
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
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${messageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
             <Text tone="muted" className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>{message}</Text>
          </div>
        )}

        {/* Form Thêm Lịch Rảnh MỚI */}
        {showForm && (
          <Card className="space-y-6 bg-white p-8 mb-8">
            <Text as="h2" size="title">Thêm Lịch Rảnh</Text>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Chọn Thứ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chọn Thứ <span className="text-red-500">*</span>
                </label>
                <select
                  name="thu"
                  value={formData.thu}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Vui lòng chọn Thứ --</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              {/* 2. Chọn Ca Học (Từ DB) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chọn Ca Học <span className="text-red-500">*</span>
                </label>
                <select
                  name="idTietHoc"
                  value={formData.idTietHoc}
                  onChange={handleInputChange}
                  disabled={!formData.thu}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white ${!formData.thu ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
                >
                  <option value="">-- {formData.thu ? 'Chọn khung giờ rảnh' : 'Vui lòng chọn Thứ trước'} --</option>
                  {availableTietHoc.map(slot => (
                    <option key={slot.idTietHoc} value={slot.idTietHoc}>
                      {formatTime(slot.gioBatDau)} - {formatTime(slot.gioKetThuc)} ({slot.soTiet} tiết)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Đang lưu...' : 'Thêm Lịch'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ thu: '', idTietHoc: '' });
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
                <Text as="p" size="caption" className="font-semibold text-blue-900">Hướng dẫn</Text>
                <Text size="fine" className="text-blue-800 mt-1">
                  Chọn các khung giờ (đã được hệ thống thiết lập sẵn) bạn rảnh để học viên có thể đặt lớp. Không thể chỉnh sửa khung giờ hệ thống, nếu sai, hãy xóa và thêm lại.
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
            <Card className="p-8 text-center"><Text tone="muted">Đang tải...</Text></Card>
          ) : lichRanhList.length === 0 ? (
            <Card className="p-8 text-center bg-gray-50">
              <Text tone="muted">Bạn chưa đăng ký lịch rảnh nào.</Text>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lichRanhList.map(lich => (
                <Card key={lich.idLichDay} className="p-6 bg-white border border-gray-200 hover:border-blue-300 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Text as="p" size="caption" className="font-semibold text-gray-700">
                        {lich.tietHoc?.thu || 'Chưa rõ thứ'}
                      </Text>
                      <Text as="p" size="body" className="font-bold text-gray-900 mt-1">
                        {formatTime(lich.tietHoc?.gioBatDau)} - {formatTime(lich.tietHoc?.gioKetThuc)}
                      </Text>
                    </div>
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Rảnh
                    </span>
                  </div>

                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <Text size="fine" tone="muted">
                      {lich.tietHoc?.soTiet} tiết ({lich.tietHoc?.soTiet * 55} phút)
                    </Text>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteLichRanh(lich.idLichDay)}
                      className="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                    >
                      Xóa Lịch Này
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Section>
    </main>
  );
}