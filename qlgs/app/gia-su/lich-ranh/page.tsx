// Đường dẫn: app/gia-su/lich-ranh/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { giaSuService, mockTietHoc } from '@/services/gia-su.service';
import { Button, Card, Section, Text } from "@/component/ui";

export default function GiaSuLichRanh() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tietHocList, setTietHocList] = useState<any[]>([]);
  const [selectedTietHoc, setSelectedTietHoc] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
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
      // Load mock TietHoc data
      setTietHocList(mockTietHoc);
    }
  }, [router]);

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

    if (selectedTietHoc.length === 0) {
      setMessage('Vui lòng chọn ít nhất 1 tiết học');
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      // Gọi API backend để thêm lịch rảnh
      await giaSuService.registerLichRanh({
        danhSachIdTietHoc: selectedTietHoc,
      });
      
      setMessage('Đăng ký lịch rảnh thành công!');
      setMessageType('success');
      setShowForm(false);
      setSelectedTietHoc([]);
    } catch (err: any) {
      setMessageType('error');
      setMessage(err.message || 'Đăng ký lịch rảnh thất bại!');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Group TietHoc by day
  const groupedByDay = tietHocList.reduce((acc, tiet) => {
    const day = tiet.thu;
    if (!acc[day]) acc[day] = [];
    acc[day].push(tiet);
    return acc;
  }, {} as Record<string, any[]>);

  const daysOrder = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

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
            Lịch Rảnh
          </Text>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
              showForm
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {showForm ? 'Hủy' : '+ Đăng Ký'}
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

        {/* Form Đăng Ký Lịch Rảnh */}
        {showForm && (
          <Card className="space-y-6 bg-white p-8 mb-8">
            <Text as="h2" size="title">
              Đăng Ký Lịch Rảnh
            </Text>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Text as="p" size="body" className="font-semibold">
                  Chọn các tiết học bạn rảnh:
                </Text>
                
                {daysOrder.map(day => (
                  groupedByDay[day] && (
                    <div key={day} className="space-y-3">
                      <Text as="p" size="caption" className="font-semibold text-gray-700">
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
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading || selectedTietHoc.length === 0} className="flex-1">
                  {loading ? 'Đang đăng ký...' : `Đăng Ký (${selectedTietHoc.length} tiết)`}
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
                  Chọn các tiết học bạn rảnh để học viên có thể đặt lớp với bạn. Bạn có thể thay đổi lịch rảnh bất kỳ lúc nào.
                </Text>
              </div>
            </div>
          </Card>
        )}

        {/* Selected Summary */}
        {selectedTietHoc.length > 0 && (
          <Card className="bg-white p-6 mb-8">
            <Text as="p" size="caption" className="font-semibold mb-4">
              Đã chọn {selectedTietHoc.length} tiết:
            </Text>
            <div className="flex flex-wrap gap-2">
              {selectedTietHoc.map(idTiet => {
                const tiet = tietHocList.find(t => t.idTietHoc === idTiet);
                return (
                  <div key={idTiet} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {tiet?.thu} {tiet?.gioBatDau}-{tiet?.gioKetThuc}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </Section>
    </main>
  );
}
