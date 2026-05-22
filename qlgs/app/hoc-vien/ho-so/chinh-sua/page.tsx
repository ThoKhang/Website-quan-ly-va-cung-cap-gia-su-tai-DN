"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Section } from "@/component/ui";
import { hocVienService, type QuanHuyenDTO, type PhuongXaDTO, type HocVienListItem } from "@/services/hoc-vien.service";
import { useAuthStore } from "@/store/auth.store";

interface PhuHuynhFormData {
  tenPhuHuynh: string;
  gioiTinh: boolean;
  ngaySinh: string;
  sdt: string;
  cccd: string;
  soNhaTenDuong: string;
  maPhuongXa?: string;
}

interface HocVienFormData {
  tenHocVien: string;
  gioiTinh: boolean;
  cccd: string;
  ngaySinh: string;
}

export default function EditHocVienHoSo() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  
  const [formData, setFormData] = useState<PhuHuynhFormData>({
    tenPhuHuynh: "",
    gioiTinh: true,
    ngaySinh: "",
    sdt: "",
    cccd: "",
    soNhaTenDuong: "",
    maPhuongXa: "",
  });
  
  const [quanHuyenList, setQuanHuyenList] = useState<QuanHuyenDTO[]>([]);
  const [phuongXaList, setPhuongXaList] = useState<PhuongXaDTO[]>([]);
  const [selectedQuanHuyen, setSelectedQuanHuyen] = useState<string>("");
  
  const [hocVienForm, setHocVienForm] = useState<HocVienFormData>({
    tenHocVien: "",
    gioiTinh: true,
    cccd: "",
    ngaySinh: "",
  });
  
  const [hocVienList, setHocVienList] = useState<HocVienListItem[]>([]);
  const [showHocVienForm, setShowHocVienForm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    setIsMounted(true);
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    fetchData();
    fetchQuanHuyen();
  }, [isLoggedIn, router]);

  const fetchQuanHuyen = async () => {
    try {
      const data = await hocVienService.getQuanHuyenList();
      setQuanHuyenList(data);
    } catch (err: any) {
      console.error("Lỗi tải danh sách Quận/Huyện:", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const phuHuynhData = await hocVienService.getPhuHuynhInfo();
      
      // Nếu có Phường/Xã, tải danh sách Phường/Xã của Quận/Huyện đó
      if (phuHuynhData.phuongXa?.maPhuongXa && phuHuynhData.phuongXa?.quanHuyen?.idQuanHuyen) {
        const quanHuyenId = phuHuynhData.phuongXa.quanHuyen.idQuanHuyen;
        setSelectedQuanHuyen(quanHuyenId);
        const phuongXaData = await hocVienService.getPhuongXaList(quanHuyenId);
        setPhuongXaList(phuongXaData);
      }
      
      setFormData({
        tenPhuHuynh: phuHuynhData.tenPhuHuynh || "",
        gioiTinh: phuHuynhData.gioiTinh !== undefined ? phuHuynhData.gioiTinh : true,
        ngaySinh: phuHuynhData.ngaySinh ? phuHuynhData.ngaySinh.split('T')[0] : "",
        sdt: phuHuynhData.sdt || "",
        cccd: phuHuynhData.cccd || "",
        soNhaTenDuong: phuHuynhData.soNhaTenDuong || "",
        maPhuongXa: phuHuynhData.phuongXa?.maPhuongXa || "",
      });

      const hocVienData = await hocVienService.getHocVienList();
      setHocVienList(hocVienData);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "idQuanHuyen") {
      setSelectedQuanHuyen(value);
      try {
        const data = await hocVienService.getPhuongXaList(value);
        setPhuongXaList(data);
        setFormData((prev) => ({
          ...prev,
          maPhuongXa: "",
        }));
      } catch (err: any) {
        console.error("Lỗi tải danh sách Phường/Xã:", err);
      }
    } else if (name === "gioiTinh") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "true",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleHocVienChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setHocVienForm((prev) => ({
      ...prev,
      [name]: type === "select-one" && name === "gioiTinh" ? value === "true" : value,
    }));
  };

  const handleAddHocVien = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (!hocVienForm.tenHocVien || !hocVienForm.ngaySinh) {
        setMessage("Vui lòng điền đầy đủ thông tin học viên (Tên và Ngày sinh)");
        setMessageType('error');
        setSubmitting(false);
        return;
      }

      await hocVienService.createProfile(hocVienForm);
      setMessage("Thêm học viên thành công!");
      setMessageType('success');
      setHocVienForm({
        tenHocVien: "",
        gioiTinh: true,
        cccd: "",
        ngaySinh: "",
      });

      const updatedList = await hocVienService.getHocVienList();
      setHocVienList(updatedList);
      setShowHocVienForm(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Có lỗi xảy ra");
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!formData.tenPhuHuynh || !formData.sdt || !formData.cccd) {
        setMessage("Vui lòng điền đầy đủ thông tin bắt buộc");
        setMessageType('error');
        setLoading(false);
        return;
      }

      await hocVienService.updatePhuHuynhInfo(formData);
      setMessage("Cập nhật thông tin phụ huynh thành công!");
      setMessageType('success');
      
      setTimeout(() => {
        router.push('/hoc-vien/ho-so');
      }, 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Có lỗi xảy ra");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="page-shell bg-slate-50 min-h-screen pb-12">
      <Section>
        <div className="max-w-4xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          
          <div className="flex items-center gap-4 mb-6">
            <Link href="/hoc-vien/ho-so">
              <Button variant="secondary" className="px-4">← Trở về</Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Cập Nhật Hồ Sơ</h1>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium animate-in slide-in-from-top duration-300 ${messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {messageType === 'success' ? '✓ ' : '✕ '}{message}
            </div>
          )}

          {/* FORM THÔNG TIN PHỤ HUYNH */}
          <Card className="bg-white p-8 shadow-md rounded-2xl border border-slate-200 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Thông Tin Cá Nhân</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên phụ huynh <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="tenPhuHuynh" 
                  value={formData.tenPhuHuynh} 
                  onChange={handleChange} 
                  placeholder="Nhập tên phụ huynh"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Giới tính</label>
                  <select
                    name="gioiTinh"
                    value={formData.gioiTinh ? "true" : "false"}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  >
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ngày sinh</label>
                  <input
                    type="date"
                    name="ngaySinh"
                    value={formData.ngaySinh}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="sdt"
                    value={formData.sdt}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">CCCD <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="cccd"
                    value={formData.cccd}
                    onChange={handleChange}
                    placeholder="Nhập số CCCD"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Quận/Huyện <span className="text-red-500">*</span></label>
                  <select
                    name="idQuanHuyen"
                    value={selectedQuanHuyen}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  >
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {quanHuyenList.map((qh) => (
                      <option key={qh.idQuanHuyen} value={qh.idQuanHuyen}>
                        {qh.tenQuanHuyen}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phường/Xã <span className="text-red-500">*</span></label>
                  <select
                    name="maPhuongXa"
                    value={formData.maPhuongXa || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    disabled={phuongXaList.length === 0}
                  >
                    <option value="">-- Chọn Phường/Xã --</option>
                    {phuongXaList.map((px) => (
                      <option key={px.maPhuongXa} value={px.maPhuongXa}>
                        {px.tenPhuongXa}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Số nhà, tên đường</label>
                <input
                  type="text"
                  name="soNhaTenDuong"
                  value={formData.soNhaTenDuong}
                  onChange={handleChange}
                  placeholder="Nhập số nhà, tên đường"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold mt-6 w-full py-3 rounded-xl transition-all hover:shadow-lg"
              >
                {loading ? '⏳ Đang lưu...' : '💾 Lưu Hồ Sơ'}
              </Button>
            </form>
          </Card>

          {/* FORM QUẢN LÝ HỌC VIÊN */}
          <Card className="bg-white p-8 shadow-md rounded-2xl border border-slate-200 animate-in slide-in-from-top duration-300 delay-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Quản Lý Học Viên</h2>
              </div>
              <Button 
                onClick={() => setShowHocVienForm(!showHocVienForm)} 
                size="sm" 
                className={`transition-all ${showHocVienForm ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-800 hover:bg-slate-900'}`}
              >
                {showHocVienForm ? '✕ Hủy' : '＋ Thêm Học Viên'}
              </Button>
            </div>

            {showHocVienForm && (
              <form onSubmit={handleAddHocVien} className="space-y-4 mb-6 p-5 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl animate-in slide-in-from-top duration-200">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên học viên <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="tenHocVien" 
                    value={hocVienForm.tenHocVien} 
                    onChange={handleHocVienChange} 
                    placeholder="Nhập tên học viên"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Giới tính <span className="text-red-500">*</span></label>
                    <select
                      name="gioiTinh"
                      value={hocVienForm.gioiTinh ? "true" : "false"}
                      onChange={handleHocVienChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                    >
                      <option value="true">Nam</option>
                      <option value="false">Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày sinh <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      name="ngaySinh"
                      value={hocVienForm.ngaySinh}
                      onChange={handleHocVienChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">CCCD</label>
                  <input
                    type="text"
                    name="cccd"
                    value={hocVienForm.cccd}
                    onChange={handleHocVienChange}
                    placeholder="Nhập số CCCD (tùy chọn)"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting} 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold w-full transition-all hover:shadow-lg"
                >
                  {submitting ? '⏳ Đang thêm...' : '✓ Thêm Học Viên'}
                </Button>
              </form>
            )}

            {hocVienList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên Học Viên</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Giới Tính</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày Sinh</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">CCCD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hocVienList.map((hocVien, idx) => (
                      <tr key={hocVien.idHocVien} className="border-b border-gray-100 hover:bg-blue-50 transition-colors animate-in fade-in duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                        <td className="py-3 px-4 font-medium text-slate-800">{hocVien.tenHocVien}</td>
                        <td className="py-3 px-4 text-slate-600">{hocVien.gioiTinh ? "Nam" : "Nữ"}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(hocVien.ngaySinh).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{hocVien.cccd || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z"/>
                </svg>
                <p className="text-sm text-slate-400 font-medium">Chưa có học viên nào.</p>
              </div>
            )}
          </Card>
        </div>
      </Section>
    </main>
  );
}
