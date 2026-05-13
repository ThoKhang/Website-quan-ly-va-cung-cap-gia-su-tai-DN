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
  tinhTrang: boolean | number | string; 
  tenKhoaHoc?: string;
  tenHocVien?: string;
  tenPhuHuynh?: string;
  sdtPhuHuynh?: string;
}

export default function GiaSuLichRanh() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [idGiaSu, setIdGiaSu] = useState('');
  const [lichRanhList, setLichRanhList] = useState<LichRanhItem[]>([]);
  
  const [systemTietHoc, setSystemTietHoc] = useState<TietHoc[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // Quản lý Tab đang hiển thị
  const [activeTab, setActiveTab] = useState<'available' | 'booked'>('available');

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
        loadSystemTietHoc();
      }
    }
  }, [router]);

  const loadSystemTietHoc = async () => {
    try {
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
      if (name === 'thu') {
        return { thu: value, idTietHoc: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    if (timeStr.includes('T')) return timeStr.split('T')[1].substring(0, 5);
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
      await giaSuService.registerLichRanh({
        danhSachIdTietHoc: [formData.idTietHoc],
      });

      setMessage('Đăng ký lịch rảnh thành công!');
      setMessageType('success');
      setShowForm(false);
      setFormData({ thu: '', idTietHoc: '' });
      setActiveTab('available'); 
      
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

  const availableTietHoc = systemTietHoc.filter(t => t.thu === formData.thu);

  // Phân loại list theo trạng thái (Xử lý triệt để 0/1, true/false)
  const availableList = lichRanhList.filter(l => 
    l.tinhTrang === true || l.tinhTrang === 1 || String(l.tinhTrang) === 'true' || String(l.tinhTrang) === '1'
  );
  const bookedList = lichRanhList.filter(l => 
    l.tinhTrang === false || l.tinhTrang === 0 || String(l.tinhTrang) === 'false' || String(l.tinhTrang) === '0'
  );

  return (
    <main className="page-shell bg-gray-50 min-h-screen">
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
            <Text as="h1" size="display" className="text-gray-900 truncate">Lịch Giảng Dạy</Text>
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
            <span className="hidden sm:inline">{showForm ? 'Hủy' : 'Thêm Lịch Rảnh'}</span>
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

        {/* Form Thêm Lịch Rảnh */}
        {showForm && (
          <Card className="space-y-6 bg-white p-8 mb-8">
            <Text as="h2" size="title">Thêm Lịch Rảnh</Text>
            <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Khu vực Tabs */}
        <div className="mb-6 flex gap-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('available')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'available' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Lịch Rảnh Chưa Đăng Ký ({availableList.length})
            {activeTab === 'available' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('booked')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'booked' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Thời Gian Biểu Lớp Học ({bookedList.length})
            {activeTab === 'booked' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></div>
            )}
          </button>
        </div>

        {/* Khu vực Danh sách hiển thị theo Tab */}
        <div>
          {loadingList ? (
            <Card className="p-8 text-center"><Text tone="muted">Đang tải dữ liệu...</Text></Card>
          ) : (
            <>
              {/* KIỂU 1: HIỂN THỊ DẠNG GRID (CHO TAB LỊCH RẢNH) */}
              {activeTab === 'available' && (
                availableList.length === 0 ? (
                  <Card className="p-8 text-center bg-gray-50">
                    <Text tone="muted">Bạn chưa có lịch rảnh nào. Vui lòng bấm "Thêm Lịch Rảnh" để bắt đầu.</Text>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableList.map(lich => (
                      <Card key={lich.idLichDay} className="p-6 bg-white border border-gray-200 hover:border-blue-300 transition shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Text as="p" size="caption" className="font-semibold text-gray-700">
                              {lich.tietHoc?.thu || 'Chưa rõ thứ'}
                            </Text>
                            <Text as="p" size="body" className="font-bold text-gray-900 mt-1">
                              {formatTime(lich.tietHoc?.gioBatDau)} - {formatTime(lich.tietHoc?.gioKetThuc)}
                            </Text>
                          </div>
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            Sẵn sàng
                          </span>
                        </div>

                        <div className="mb-4 pb-4 border-b border-gray-100">
                          <Text size="fine" tone="muted">
                            {lich.tietHoc?.soTiet} tiết ({lich.tietHoc?.soTiet * 55} phút)
                          </Text>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteLichRanh(lich.idLichDay)}
                            className="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                          >
                            Xóa Lịch Rảnh
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )
              )}

              {/* KIỂU 2: HIỂN THỊ DẠNG THỜI GIAN BIỂU (CHO TAB ĐÃ ĐĂNG KÝ) */}
              {activeTab === 'booked' && (
                bookedList.length === 0 ? (
                  <Card className="p-8 text-center bg-gray-50">
                    <Text tone="muted">Chưa có học viên nào đăng ký lớp của bạn vào các khung giờ này.</Text>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    {daysOfWeek.map(day => {
                      // Lọc các lịch ĐÃ BOOK theo từng Thứ, sắp xếp theo giờ
                      const schedulesOfDay = bookedList
                        .filter(l => l.tietHoc?.thu === day)
                        .sort((a, b) => a.tietHoc.gioBatDau.localeCompare(b.tietHoc.gioBatDau));

                      if (schedulesOfDay.length === 0) return null;

                      return (
                        <div key={day} className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
                            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                            <Text as="h3" size="title" className="font-bold text-gray-800">{day}</Text>
                            <span className="ml-auto text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                              {schedulesOfDay.length} ca dạy
                            </span>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {schedulesOfDay.map(lich => (
                              <div 
                                key={lich.idLichDay} 
                                className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border-l-4 border-l-orange-400 bg-orange-50/30 border border-orange-100 transition-all hover:shadow-md"
                              >
                                {/* Cột Thời gian */}
                                <div className="sm:w-32 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-orange-200 pb-3 sm:pb-0 sm:pr-4 flex flex-col justify-center">
                                  <Text className="font-bold text-gray-900 text-lg">{formatTime(lich.tietHoc?.gioBatDau)}</Text>
                                  <Text className="font-medium text-gray-500 text-sm mb-1">đến {formatTime(lich.tietHoc?.gioKetThuc)}</Text>
                                  <span className="inline-block w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 bg-orange-100 text-orange-700">
                                    Đã có lớp
                                  </span>
                                </div>

                                {/* Cột Chi tiết Lớp học */}
                                <div className="flex-1 flex flex-col justify-center space-y-1.5">
                                  <Text size="fine" className="text-gray-900 font-semibold flex items-center gap-2">
                                    📚 {lich.tenKhoaHoc || <span className="italic font-normal text-gray-400">Đang cập nhật khóa học...</span>}
                                  </Text>
                                  <Text size="fine" className="text-gray-700">
                                    👤 Học viên: <span className="font-medium">{lich.tenHocVien || 'Chưa rõ'}</span>
                                  </Text>
                                  <Text size="fine" className="text-gray-700">
                                    📞 Phụ huynh: {lich.tenPhuHuynh || 'Chưa rõ'} 
                                    {lich.sdtPhuHuynh && <span className="text-blue-600 font-medium ml-1">({lich.sdtPhuHuynh})</span>}
                                  </Text>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </Section>
    </main>
  );
}