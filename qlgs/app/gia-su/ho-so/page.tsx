"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, Section, Text } from "@/component/ui";
import { BangCap } from "@/types/auth.type";
import axiosClient from '@/services/axiosClient'; // Đảm bảo import axiosClient

export default function GiaSuHoSo() {
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    tenGiaSu: '',
    sdt: '',
    cccd: '',
  });
  const [bangCapList, setBangCapList] = useState<BangCap[]>([]);
  const [showBangCapForm, setShowBangCapForm] = useState(false);
  const [bangCapForm, setBangCapForm] = useState({
    tenBangCap: '',
    thongTinBangCap: '',
    ngayCap: '',
    anhMinhChung: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Kiểm tra xem có ít nhất 1 bằng cấp đã được duyệt hay chưa
  const hasApprovedDegree = bangCapList.some(bc => bc.trangThai === true);

  // Đảm bảo component đã mount trước khi truy cập localStorage
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Chỉ chạy khi component đã mount
    if (!isMounted) return;

    // Lấy thông tin gia sư hiện tại từ API thông qua axiosClient
    const fetchGiaSuInfo = async () => {
      try {
        // Dùng API "thong-tin-hien-tai" sẽ tự động tạo hồ sơ trống nếu chưa có
        const data: any = await axiosClient.get('/gia-su/thong-tin-hien-tai');
        
        // Lưu idGiaSu vào localStorage phòng khi cần dùng ở chỗ khác
        if (data.idGiaSu) {
            localStorage.setItem('idGiaSu', data.idGiaSu);
        }

        setFormData({
          tenGiaSu: data.tenGiaSu || '',
          sdt: data.sdt || '',
          cccd: data.cccd || '',
        });
        
        // Lấy danh sách bằng cấp
        if (data.bangCapList && Array.isArray(data.bangCapList)) {
          setBangCapList(data.bangCapList);
        }
        console.log('✅ Tải thông tin hồ sơ thành công');
      } catch (error: any) {
        console.error('❌ Lỗi khi lấy thông tin:', error);
        setMessage(typeof error === 'string' ? error : 'Lỗi kết nối đến máy chủ');
        setMessageType('error');
      }
    };

    fetchGiaSuInfo();
  }, [isMounted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBangCapChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBangCapForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddBangCap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Dùng axiosClient gửi request thêm bằng cấp
      const response: any = await axiosClient.post('/gia-su/them-bang-cap', bangCapForm);

      setMessage('Đã gửi yêu cầu thêm bằng cấp. Vui lòng chờ Admin duyệt!');
      setMessageType('success');
      
      // Thêm bằng cấp vào danh sách UI với trạng thái mặc định là chưa duyệt (false)
      // Nếu API trả về object bằng cấp mới, ta dùng nó, nếu không thì dùng form hiện tại
      const newBangCap = { 
          ...bangCapForm, 
          idBangCap: response.idBangCap || Date.now().toString(), // fallback id
          trangThai: false 
      };
      
      setBangCapList([...bangCapList, newBangCap]);
      
      // Reset form
      setBangCapForm({
        tenBangCap: '',
        thongTinBangCap: '',
        ngayCap: '',
        anhMinhChung: '',
      });
      setShowBangCapForm(false);
    } catch (error: any) {
      console.error('Lỗi:', error);
      setMessage(typeof error === 'string' ? error : 'Thêm bằng cấp thất bại. Vui lòng thử lại.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBangCap = async (index: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bằng cấp này?')) {
      return;
    }

    try {
      const bangCap = bangCapList[index];

      if (!bangCap.idBangCap) {
        setMessage('Không thể xóa bằng cấp này');
        setMessageType('error');
        return;
      }

      await axiosClient.delete(`/gia-su/bang-cap/${bangCap.idBangCap}`);

      setMessage('Bằng cấp đã được xóa thành công!');
      setMessageType('success');
      setBangCapList(bangCapList.filter((_, i) => i !== index));
    } catch (error: any) {
      console.error('Lỗi:', error);
      setMessage(typeof error === 'string' ? error : 'Xóa bằng cấp thất bại. Vui lòng thử lại.');
      setMessageType('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (!formData.tenGiaSu.trim()) {
      setMessage('Vui lòng nhập họ và tên');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (!formData.sdt.trim()) {
      setMessage('Vui lòng nhập số điện thoại');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (!/^\d{10,11}$/.test(formData.sdt.trim())) {
      setMessage('Số điện thoại phải là 10-11 chữ số');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (!formData.cccd.trim()) {
      setMessage('Vui lòng nhập CCCD');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (!/^\d{12}$/.test(formData.cccd.trim())) {
      setMessage('CCCD phải là 12 chữ số');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const idGiaSu = localStorage.getItem('idGiaSu');

      if (!idGiaSu) {
        setMessage('Vui lòng đăng nhập lại');
        setMessageType('error');
        return;
      }

      await axiosClient.put(`/gia-su/${idGiaSu}`, formData);

      setMessage('Hồ sơ đã được cập nhật thành công!');
      setMessageType('success');
      console.log('✅ Cập nhật hồ sơ thành công');
    } catch (error: any) {
      console.error('❌ Lỗi:', error);
      setMessage(typeof error === 'string' ? error : 'Cập nhật thất bại. Vui lòng kiểm tra lại.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Text as="h1" size="hero" className="mb-2">Hồ Sơ Cá Nhân</Text>
            <Text size="lead" tone="muted">
              Cập nhật thông tin cá nhân, số điện thoại, CCCD và bằng cấp của bạn
            </Text>
          </div>

          {/* CẢNH BÁO TÌNH TRẠNG CẤP PHÉP TẠO KHÓA HỌC */}
          {!hasApprovedDegree && bangCapList.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg shadow-sm">
              <span className="font-bold">⚠️ Lưu ý:</span> Bằng cấp của bạn đang chờ Admin phê duyệt. Bạn chỉ có thể tạo Khóa học sau khi có ít nhất 1 bằng cấp được duyệt hợp lệ.
            </div>
          )}

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Thông tin cá nhân */}
          <Card className="bg-white p-8 mb-8">
            <Text as="h2" size="display" className="mb-6 font-semibold">Thông Tin Cá Nhân</Text>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="tenGiaSu"
                  value={formData.tenGiaSu}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="sdt"
                  value={formData.sdt}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CCCD
                </label>
                <input
                  type="text"
                  name="cccd"
                  value={formData.cccd}
                  onChange={handleChange}
                  placeholder="Nhập số CCCD"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" size="lg" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu thông tin'}
                </Button>
                <Link href="/#gia-su-features">
                  <Button type="button" size="lg" variant="secondary">
                    Hủy
                  </Button>
                </Link>
              </div>
            </form>
          </Card>

          {/* Bằng cấp */}
          <Card className="bg-white p-8">
            <div className="flex justify-between items-center mb-6">
              <Text as="h2" size="display" className="font-semibold">Bằng Cấp & Chứng Chỉ</Text>
              <Button 
                onClick={() => setShowBangCapForm(!showBangCapForm)}
                size="sm"
              >
                {showBangCapForm ? 'Hủy' : '+ Thêm bằng cấp'}
              </Button>
            </div>

            {/* Form thêm bằng cấp */}
            {showBangCapForm && (
              <form onSubmit={handleAddBangCap} className="space-y-6 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên bằng cấp
                  </label>
                  <input
                    type="text"
                    name="tenBangCap"
                    value={bangCapForm.tenBangCap}
                    onChange={handleBangCapChange}
                    placeholder="Ví dụ: Cử nhân Sư phạm Toán"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thông tin bằng cấp
                  </label>
                  <textarea
                    name="thongTinBangCap"
                    value={bangCapForm.thongTinBangCap}
                    onChange={handleBangCapChange}
                    placeholder="Mô tả chi tiết về bằng cấp"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày cấp
                  </label>
                  <input
                    type="date"
                    name="ngayCap"
                    value={bangCapForm.ngayCap}
                    onChange={handleBangCapChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh minh chứng
                  </label>
                  <input
                    type="text"
                    name="anhMinhChung"
                    value={bangCapForm.anhMinhChung}
                    onChange={handleBangCapChange}
                    placeholder="URL ảnh hoặc đường dẫn file"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" size="lg" disabled={loading}>
                    {loading ? 'Đang thêm...' : 'Thêm bằng cấp'}
                  </Button>
                  <Button 
                    type="button" 
                    size="lg" 
                    variant="secondary"
                    onClick={() => setShowBangCapForm(false)}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            )}

            {/* Danh sách bằng cấp */}
            {bangCapList.length > 0 ? (
              <div className="space-y-4">
                {bangCapList.map((bangCap, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition relative overflow-hidden">
                    {/* HUY HIỆU TRẠNG THÁI (Được thêm vào góc phải trên) */}
                    <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white ${bangCap.trangThai ? 'bg-green-500' : 'bg-yellow-500'}`}>
                      {bangCap.trangThai ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
                    </div>

                    <div className="flex justify-between items-start mt-2 mb-3">
                      <div className="flex-1">
                        <Text as="h3" size="body" className="font-semibold text-gray-900">
                          {bangCap.tenBangCap}
                        </Text>
                        <Text size="caption" tone="muted" className="mt-1">
                          Ngày cấp: {bangCap.ngayCap ? new Date(bangCap.ngayCap).toLocaleDateString('vi-VN') : 'N/A'}
                        </Text>
                      </div>
                      <Button
                        onClick={() => handleDeleteBangCap(index)}
                        size="sm"
                        variant="secondary"
                        className="text-red-600 hover:text-red-700"
                      >
                        Xóa
                      </Button>
                    </div>
                    <Text size="caption" className="text-gray-700 mb-2">
                      {bangCap.thongTinBangCap}
                    </Text>
                    {bangCap.anhMinhChung && (
                      <Text size="caption" tone="muted">
                        Ảnh: {bangCap.anhMinhChung}
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Text size="caption" tone="muted">
                  Chưa có bằng cấp nào. Hãy thêm bằng cấp của bạn để tăng độ tin cậy và có thể tạo Khóa học.
                </Text>
              </div>
            )}
          </Card>
        </div>
      </Section>
    </main>
  );
}