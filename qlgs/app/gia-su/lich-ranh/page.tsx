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

  // Hàm map thứ → màu nhạt
  const getDayColor = (day: string) => {
    const colorMap: Record<string, { bg: string; border: string; accent: string }> = {
      'Thứ 2': { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'bg-blue-100' },
      'Thứ 3': { bg: 'bg-purple-50', border: 'border-purple-200', accent: 'bg-purple-100' },
      'Thứ 4': { bg: 'bg-pink-50', border: 'border-pink-200', accent: 'bg-pink-100' },
      'Thứ 5': { bg: 'bg-orange-50', border: 'border-orange-200', accent: 'bg-orange-100' },
      'Thứ 6': { bg: 'bg-yellow-50', border: 'border-yellow-200', accent: 'bg-yellow-100' },
      'Thứ 7': { bg: 'bg-green-50', border: 'border-green-200', accent: 'bg-green-100' },
      'Chủ nhật': { bg: 'bg-red-50', border: 'border-red-200', accent: 'bg-red-100' },
    };
    return colorMap[day] || { bg: 'bg-slate-50', border: 'border-slate-200', accent: 'bg-slate-100' };
  };

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
    <main className="page-shell bg-slate-50 min-h-screen">
      {/* Main Content */}
      <Section className="py-6 md:py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header với nút Quay lại */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/#gia-su-features" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition flex-shrink-0 group">
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <Text as="span" size="caption" className="font-semibold whitespace-nowrap">Quay Lại</Text>
            </Link>
            <h1 className="text-[50px] font-bold text-slate-900">Lịch Giảng Dạy</h1>
          </div>
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 font-medium shadow-sm ${messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d={messageType === 'success' ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" : "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"} clipRule="evenodd" />
            </svg>
            <Text tone="muted" className="flex-1">{message}</Text>
          </div>
        )}

        {/* Form Thêm Lịch Rảnh */}
        {showForm && (
          <Card className="space-y-6 bg-white p-8 mb-8 rounded-2xl shadow-md border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <Text as="h2" size="title" className="font-bold text-slate-900">Thêm Lịch Rảnh Mới</Text>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">
                  Chọn Thứ <span className="text-red-500">*</span>
                </label>
                <select
                  name="thu"
                  value={formData.thu}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium text-slate-900 transition"
                >
                  <option value="">-- Vui lòng chọn Thứ --</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">
                  Chọn Ca Học <span className="text-red-500">*</span>
                </label>
                <select
                  name="idTietHoc"
                  value={formData.idTietHoc}
                  onChange={handleInputChange}
                  disabled={!formData.thu}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium transition ${!formData.thu ? 'border-slate-200 bg-slate-100 cursor-not-allowed text-slate-400' : 'border-slate-300 text-slate-900'}`}
                >
                  <option value="">-- {formData.thu ? 'Chọn khung giờ rảnh' : 'Vui lòng chọn Thứ trước'} --</option>
                  {availableTietHoc.map(slot => (
                    <option key={slot.idTietHoc} value={slot.idTietHoc}>
                      {formatTime(slot.gioBatDau)} - {formatTime(slot.gioKetThuc)} ({slot.soTiet} tiết)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3">
                  {loading ? '⏳ Đang lưu...' : '✓ Thêm Lịch'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ thu: '', idTietHoc: '' });
                  }}
                  className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl py-3"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Khu vực Tabs với nút Thêm Lịch Rảnh */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === 'available' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ✓ Lịch Rảnh Chưa Đăng Ký ({availableList.length})
              {activeTab === 'available' && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-md"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('booked')}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === 'booked' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              📚 Thời Gian Biểu Lớp Học ({bookedList.length})
              {activeTab === 'booked' && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-md"></div>
              )}
            </button>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-5 py-2.5 rounded-xl transition text-sm font-semibold flex items-center gap-2 flex-shrink-0 shadow-md hover:shadow-lg whitespace-nowrap ${
              showForm ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
            </svg>
            <span className="hidden sm:inline">{showForm ? 'Hủy' : 'Thêm Lịch Rảnh'}</span>
            <span className="sm:hidden">{showForm ? '✕' : '＋'}</span>
          </button>
        </div>

        {/* Khu vực Danh sách hiển thị theo Tab */}
        <div>
          {loadingList ? (
            <Card className="p-12 text-center bg-white rounded-2xl shadow-md border border-slate-200">
              <div className="flex justify-center mb-4">
                <div className="animate-spin">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              <Text tone="muted" className="text-slate-600 font-medium">Đang tải dữ liệu...</Text>
            </Card>
          ) : (
            <>
              {/* KIỂU 1: HIỂN THỊ DẠNG GRID (CHO TAB LỊCH RẢNH) */}
              {activeTab === 'available' && (
                availableList.length === 0 ? (
                  <Card className="p-12 text-center bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-4xl mb-3">📭</div>
                    <Text tone="muted" className="text-slate-600 font-medium">Bạn chưa có lịch rảnh nào. Vui lòng bấm "Thêm Lịch Rảnh" để bắt đầu.</Text>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
                    {availableList.map(lich => {
                      const dayColor = getDayColor(lich.tietHoc?.thu || '');
                      return (
                        <div key={lich.idLichDay} className={`p-6 border-2 rounded-2xl shadow-md hover:shadow-lg transition-all ${dayColor.bg} ${dayColor.border}`}>
                          <div className="flex justify-between items-start mb-5">
                            <div>
                              <Text as="p" size="caption" className="font-bold text-slate-600 uppercase tracking-wide">
                                {lich.tietHoc?.thu || 'Chưa rõ thứ'}
                              </Text>
                              <Text as="p" size="body" className="font-bold text-slate-900 mt-2 text-lg">
                                {formatTime(lich.tietHoc?.gioBatDau)} - {formatTime(lich.tietHoc?.gioKetThuc)}
                              </Text>
                            </div>
                            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 shadow-sm">
                              ✓ Sẵn sàng
                            </span>
                          </div>

                          <div className="mb-5 pb-5 border-b" style={{ borderColor: dayColor.border.split('-')[1] }}>
                            <Text size="fine" tone="muted" className="text-slate-600 font-medium">
                              ⏱️ {lich.tietHoc?.soTiet} tiết ({lich.tietHoc?.soTiet ? lich.tietHoc.soTiet * 55 : 0} phút)
                            </Text>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteLichRanh(lich.idLichDay)}
                              className="w-full px-4 py-2.5 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition font-bold text-sm"
                            >
                              🗑️ Xóa Lịch Rảnh
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* KIỂU 2: HIỂN THỊ DẠNG THỜI GIAN BIỂU (CHO TAB ĐÃ ĐĂNG KÝ) */}
              {activeTab === 'booked' && (
                bookedList.length === 0 ? (
                  <Card className="p-12 text-center bg-gradient-to-br from-slate-50 to-orange-50 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-4xl mb-3">📭</div>
                    <Text tone="muted" className="text-slate-600 font-medium">Chưa có học viên nào đăng ký lớp của bạn vào các khung giờ này.</Text>
                  </Card>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    {daysOfWeek.map(day => {
                      // Lọc các lịch ĐÃ BOOK theo từng Thứ, sắp xếp theo giờ
                      const schedulesOfDay = bookedList
                        .filter(l => l.tietHoc?.thu === day)
                        .sort((a, b) => a.tietHoc.gioBatDau.localeCompare(b.tietHoc.gioBatDau));

                      if (schedulesOfDay.length === 0) return null;

                      return (
                        <div key={day} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-md hover:shadow-lg transition-shadow">
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-1.5 h-7 bg-gradient-to-b from-blue-600 to-blue-500 rounded-full"></div>
                            <Text as="h3" size="title" className="font-bold text-slate-900">{day}</Text>
                            <span className="ml-auto text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                              {schedulesOfDay.length} ca dạy
                            </span>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {schedulesOfDay.map(lich => {
                              const dayColor = getDayColor(day);
                              return (
                                <div 
                                  key={lich.idLichDay} 
                                  className={`flex flex-col sm:flex-row gap-4 p-5 rounded-xl border-l-4 border border-2 transition-all hover:shadow-md ${dayColor.bg} ${dayColor.border}`}
                                  style={{ borderLeftColor: dayColor.accent }}
                                >
                                  {/* Cột Thời gian */}
                                  <div className="sm:w-32 flex-shrink-0 border-b sm:border-b-0 sm:border-r pb-3 sm:pb-0 sm:pr-4 flex flex-col justify-center" style={{ borderColor: dayColor.border.split('-')[1] }}>
                                    <Text className="font-bold text-slate-900 text-lg">{formatTime(lich.tietHoc?.gioBatDau)}</Text>
                                    <Text className="font-medium text-slate-600 text-sm mb-2">đến {formatTime(lich.tietHoc?.gioKetThuc)}</Text>
                                    <span className={`inline-block w-fit px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase shadow-sm ${dayColor.accent} text-slate-700`}>
                                      📚 Đã có lớp
                                    </span>
                                  </div>

                                  {/* Cột Chi tiết Lớp học */}
                                  <div className="flex-1 flex flex-col justify-center space-y-2">
                                    <Text size="fine" className="text-slate-900 font-bold flex items-center gap-2">
                                      📖 {lich.tenKhoaHoc || <span className="italic font-normal text-slate-400">Đang cập nhật khóa học...</span>}
                                    </Text>
                                    <Text size="fine" className="text-slate-700 font-medium">
                                      👤 Học viên: <span className="text-blue-600">{lich.tenHocVien || 'Chưa rõ'}</span>
                                    </Text>
                                    <Text size="fine" className="text-slate-700 font-medium">
                                      👨‍👩‍👧 Phụ huynh: {lich.tenPhuHuynh || 'Chưa rõ'} 
                                      {lich.sdtPhuHuynh && <span className="text-blue-600 font-bold ml-1">({lich.sdtPhuHuynh})</span>}
                                    </Text>
                                  </div>
                                </div>
                              );
                            })}
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
        </div>
      </Section>
    </main>
  );
}