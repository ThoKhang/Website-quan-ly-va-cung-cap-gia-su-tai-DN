// app/admin/khoa-hoc/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, Search, BookOpen, Loader2 } from 'lucide-react';
import axiosClient from '@/services/axiosClient';

interface CourseAdminDTO {
  idKhoaHoc: string;
  tenKhoaHoc: string;
  tenGiaSu: string;
  tenMonHoc: string;
  tenLop: string;
  soTienHoc: number;
  soBuoiHoc: number;
  trangThai: number;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseAdminDTO[]>([]);
  const [activeTab, setActiveTab] = useState<0 | 1 | -1>(0); // 0: Chờ duyệt, 1: Đã duyệt, -1: Đã ẩn
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

    const fetchCourses = async () => {
        try {
        setLoading(true);
        // ĐÃ SỬA ĐƯỜNG DẪN: Bỏ chữ "booking" đi
        const data: any = await axiosClient.get('/khoa-hoc/admin/khoa-hoc'); 
        setCourses(data || []);
        } catch (error) {
        console.error("Lỗi tải danh sách khóa học:", error);
        } finally {
        setLoading(false);
        }
    };

  useEffect(() => {
    fetchCourses();
  }, []);

    const handleApproval = async (idKhoaHoc: string, status: number) => {
        if (!confirm(status === 1 ? "Bạn có chắc chắn muốn duyệt khóa học này?" : "Bạn có chắc chắn muốn từ chối khóa học này?")) return;
        try {
        // ĐÃ SỬA: Dùng Query Param ?status= để khớp với @RequestParam Integer status ở Backend
        await axiosClient.put(`/khoa-hoc/${idKhoaHoc}/duyet?status=${status}`);
        alert("Cập nhật trạng thái thành công!");
        fetchCourses(); 
        } catch (error: any) {
        alert(error || "Không thể thực hiện thao tác");
        }
    };

  // Hàm xử lý Xóa mềm khóa học (Giao tiếp với xoaKhoaHoc / deleteKhoaHoc trong KhoaHocService.java)
    const handleSoftDelete = async (idKhoaHoc: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa mềm khóa học này? Học viên cũ vẫn có thể xem lại lịch sử.")) return;
        try {
        // ĐÃ SỬA ĐƯỜNG DẪN:
        await axiosClient.delete(`/khoa-hoc/${idKhoaHoc}`);
        alert("Đã xóa mềm khóa học thành công!");
        fetchCourses();
        } catch (error: any) {
        alert(error || "Không thể xóa khóa học này do đang có học viên theo học.");
        }
    };

  // Lọc danh sách theo Tab hiện tại và ô tìm kiếm
  const filteredCourses = courses.filter(course => 
    course.trangThai === activeTab &&
    (course.tenKhoaHoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
     course.tenGiaSu.toLowerCase().includes(searchTerm.toLowerCase()) ||
     course.idKhoaHoc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* Tiêu đề trang */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="text-[#4A7766]" /> Quản lý danh sách khóa học
            </h1>
            <p className="text-gray-500 text-sm mt-1">Kiểm soát, phê duyệt và điều phối các lớp học trên toàn hệ thống</p>
          </div>
          
          {/* Thanh tìm kiếm */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo mã, tên khóa, gia sư..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7766]"
            />
          </div>
        </div>

        {/* Hệ thống chuyển đổi Tabs Trạng thái */}
        <div className="flex space-x-1 mb-6 bg-white w-fit p-1 rounded-full border border-gray-200 shadow-sm">
          <button 
            onClick={() => setActiveTab(0)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 0 ? 'bg-[#4A7766] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Chờ phê duyệt ({courses.filter(c => c.trangThai === 0).length})
          </button>
          <button 
            onClick={() => setActiveTab(1)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 1 ? 'bg-[#4A7766] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Đang hoạt động ({courses.filter(c => c.trangThai === 1).length})
          </button>
          <button 
            onClick={() => setActiveTab(-1)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeTab === -1 ? 'bg-[#4A7766] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Đã ẩn / Xóa mềm ({courses.filter(c => c.trangThai === -1).length})
          </button>
        </div>

        {/* Nội dung bảng hiển thị dữ liệu */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-[#4A7766]">
            <Loader2 className="animate-spin mb-2" size={32} />
            <span className="text-gray-500 text-sm font-medium">Đang đồng bộ dữ liệu lớp học...</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-xs text-gray-600 uppercase font-semibold">
                    <th className="py-3.5 px-4">Mã Khóa</th>
                    <th className="py-3.5 px-4">Tên Khóa Học</th>
                    <th className="py-3.5 px-4">Gia Sư Chưởng Quản</th>
                    <th className="py-3.5 px-4">Môn Học & Lớp</th>
                    <th className="py-3.5 px-4 text-right">Tổng Học Phí</th>
                    <th className="py-3.5 px-4 text-center">Số Buổi</th>
                    <th className="py-3.5 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                  {filteredCourses.map((course) => (
                    <tr key={course.idKhoaHoc} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono text-xs text-gray-500 font-bold">{course.idKhoaHoc}</td>
                      <td className="py-4 px-4 font-medium text-gray-900">{course.tenKhoaHoc}</td>
                      <td className="py-4 px-4 text-gray-600">{course.tenGiaSu}</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium mr-1.5">{course.tenMonHoc}</span>
                        <span className="text-xs text-gray-500">{course.tenLop}</span>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">{formatCurrency(course.soTienHoc)}</td>
                      <td className="py-4 px-4 text-center text-gray-500">{course.soBuoiHoc} buổi</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Render nút dựa theo trạng thái Tab */}
                          {course.trangThai === 0 && (
                            <>
                              <button 
                                onClick={() => handleApproval(course.idKhoaHoc, 1)}
                                className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Phê duyệt xuất bản"
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                onClick={() => handleApproval(course.idKhoaHoc, 2)}
                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Từ chối phê duyệt"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                          {course.trangThai === 1 && (
                            <button 
                              onClick={() => handleSoftDelete(course.idKhoaHoc)}
                              className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                              title="Xóa mềm (Ẩn khóa học)"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {course.trangThai === -1 && (
                            <button 
                              onClick={() => handleApproval(course.idKhoaHoc, 1)}
                              className="px-2.5 py-1 text-xs font-medium border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
                            >
                              Khôi phục
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                        Không tìm thấy dữ liệu khóa học nào thuộc phân mục này.
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