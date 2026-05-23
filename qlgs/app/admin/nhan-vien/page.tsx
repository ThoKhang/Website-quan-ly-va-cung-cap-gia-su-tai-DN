'use client';

import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, ShieldCheck, Users, UserCog, GraduationCap, Lock, Unlock, Loader2 } from 'lucide-react';
import axiosClient from '@/services/axiosClient';

interface TaiKhoanAdminDTO {
  idTaiKhoan: string;
  tenDangNhap: string;
  email: string;
  loaiNguoiDungID: string;
  trangThai: number;
  ngayTao: string;
}

export default function AdminQuanLyTaiKhoanPage() {
  const [danhSach, setDanhSach] = useState<TaiKhoanAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const data: any = await axiosClient.get('/tai-khoan/admin');
      setDanhSach(data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách tài khoản:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleLock = async (idTaiKhoan: string, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const actionName = newStatus === 0 ? "KHÓA" : "MỞ KHÓA";
    
    if (!confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản này?`)) return;
    
    try {
      await axiosClient.put(`/tai-khoan/admin/${idTaiKhoan}/trang-thai?trangThai=${newStatus}`);
      fetchData(); // Cập nhật lại UI
    } catch (error: any) {
      alert(error || "Không thể thực hiện thao tác");
    }
  };

  // Logic Lọc Dữ Liệu
  const filtered = danhSach.filter(tk => {
    const matchTab = 
      activeTab === 'all' ? true :
      activeTab === 'phu_huynh' ? tk.loaiNguoiDungID === '1' :
      activeTab === 'gia_su' ? tk.loaiNguoiDungID === '2' :
      activeTab === 'nhan_vien' ? tk.loaiNguoiDungID === '4' : false;

    const matchSearch = 
      tk.tenDangNhap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tk.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchTab && matchSearch;
  });

  const getRoleName = (roleId: string) => {
    switch (roleId) {
      case '1': return <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md font-medium flex items-center gap-1 w-fit"><Users size={14}/> Phụ huynh</span>;
      case '2': return <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md font-medium flex items-center gap-1 w-fit"><GraduationCap size={14}/> Gia sư</span>;
      case '4': return <span className="text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md font-medium flex items-center gap-1 w-fit"><UserCog size={14}/> Admin / Nhân viên</span>;
      default: return <span className="text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">Không xác định</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShieldCheck className="text-[#4A7766]" /> Quản lý tài khoản
            </h1>
            <p className="text-gray-500 text-sm mt-1">Kiểm soát truy cập của nhân viên, gia sư và phụ huynh</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm username, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7766]/50"
            />
          </div>
        </div>

        {/* Tabs phân loại */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white w-fit p-1.5 rounded-xl border border-gray-200 shadow-sm">
          {[
            { id: 'all', label: `Tất cả (${danhSach.length})` },
            { id: 'nhan_vien', label: `Admin (${danhSach.filter(t => t.loaiNguoiDungID === '4').length})` },
            { id: 'gia_su', label: `Gia sư (${danhSach.filter(t => t.loaiNguoiDungID === '2').length})` },
            { id: 'phu_huynh', label: `Phụ huynh (${danhSach.filter(t => t.loaiNguoiDungID === '1').length})` },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                ? 'bg-[#4A7766] text-white shadow-sm' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-[#4A7766]">
            <Loader2 className="animate-spin mb-3" size={32} />
            <span className="text-sm font-medium">Đang tải dữ liệu người dùng...</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-xs text-gray-500 uppercase font-semibold">
                    <th className="py-4 px-5">Tài khoản</th>
                    <th className="py-4 px-5">Email liên hệ</th>
                    <th className="py-4 px-5">Vai trò</th>
                    <th className="py-4 px-5">Ngày tạo</th>
                    <th className="py-4 px-5 text-center">Trạng thái</th>
                    <th className="py-4 px-5 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                  {filtered.map((tk) => (
                    <tr key={tk.idTaiKhoan} className={`transition-colors hover:bg-gray-50/50 ${tk.trangThai === 0 ? 'bg-red-50/30' : ''}`}>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-gray-900">{tk.tenDangNhap}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">{tk.idTaiKhoan}</div>
                      </td>
                      <td className="py-4 px-5 text-gray-600">{tk.email || '—'}</td>
                      <td className="py-4 px-5">
                        {getRoleName(tk.loaiNguoiDungID)}
                      </td>
                      <td className="py-4 px-5 text-gray-500">
                        {tk.ngayTao ? new Date(tk.ngayTao).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td className="py-4 px-5 text-center">
                        {tk.trangThai === 1 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-center">
                        {/* Không cho phép Admin tự khóa chính mình (để tránh tự hủy) */}
                        {tk.loaiNguoiDungID === '4' ? (
                          <span className="text-xs text-gray-400 italic">Bảo vệ hệ thống</span>
                        ) : (
                          <button 
                            onClick={() => handleToggleLock(tk.idTaiKhoan, tk.trangThai)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              tk.trangThai === 1 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                            }`}
                          >
                            {tk.trangThai === 1 ? <><Lock size={14}/> Khóa TK</> : <><Unlock size={14}/> Mở khóa</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-gray-400">
                        <ShieldAlert size={32} className="mx-auto mb-3 opacity-30" />
                        Không tìm thấy tài khoản nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}