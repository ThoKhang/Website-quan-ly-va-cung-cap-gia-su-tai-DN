// app/admin/khoa-hoc/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, Search, BookOpen, Loader2, RotateCcw } from 'lucide-react';
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
  anhMinhHoa: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseAdminDTO[]>([]);
  const [activeTab, setActiveTab] = useState<0 | 1 | -1>(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data: any = await axiosClient.get('/khoa-hoc/admin/khoa-hoc');
      setCourses(data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách khóa học:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleApproval = async (idKhoaHoc: string, status: number) => {
    if (!confirm(status === 1 ? "Duyệt khóa học này?" : "Từ chối khóa học này?")) return;
    try {
      await axiosClient.put(`/khoa-hoc/${idKhoaHoc}/duyet?status=${status}`);
      alert("Cập nhật thành công!");
      fetchCourses();
    } catch (error: any) {
      alert(error || "Không thể thực hiện thao tác");
    }
  };

  const handleSoftDelete = async (idKhoaHoc: string) => {
    if (!confirm("Xóa mềm khóa học này?")) return;
    try {
      await axiosClient.delete(`/khoa-hoc/${idKhoaHoc}`);
      alert("Đã xóa mềm thành công!");
      fetchCourses();
    } catch (error: any) {
      alert(error || "Không thể xóa khóa học này.");
    }
  };

  const filteredCourses = courses.filter(course =>
    course.trangThai === activeTab &&
    (course.tenKhoaHoc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     course.tenGiaSu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     course.idKhoaHoc?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  const tabs = [
    { value: 0 as const,  label: 'Chờ phê duyệt',    color: 'amber'  },
    { value: 1 as const,  label: 'Đang hoạt động',    color: 'green'  },
    { value: -1 as const, label: 'Đã ẩn / Xóa mềm',  color: 'gray'   },
  ];

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="text-[#4A7766]" /> Quản lý khóa học
            </h1>
            <p className="text-gray-400 text-sm mt-1">Phê duyệt và điều phối các lớp học trên hệ thống</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm mã, tên khóa, gia sư..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7766]/30 focus:border-[#4A7766]"
            />
          </div>
        </div>

        {/* Tabs + Stats */}
        <div className="grid grid-cols-3 gap-3">
          {tabs.map((tab) => {
            const count = courses.filter(c => c.trangThai === tab.value).length;
            const isActive = activeTab === tab.value;
            const colorMap: Record<string, string> = {
              amber: isActive ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-600 border-amber-200 hover:border-amber-400',
              green: isActive ? 'bg-[#4A7766] text-white border-[#4A7766]' : 'bg-white text-[#4A7766] border-[#4A7766]/30 hover:border-[#4A7766]',
              gray:  isActive ? 'bg-gray-600 text-white border-gray-600'   : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400',
            };
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${colorMap[tab.color]}`}
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm font-medium mt-1 opacity-90">{tab.label}</div>
              </button>
            );
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-[#4A7766]">
            <Loader2 className="animate-spin mb-3" size={32} />
            <span className="text-gray-400 text-sm">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[960px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase font-semibold tracking-wide">
                    <th className="py-3.5 px-4">Khóa học</th>
                    <th className="py-3.5 px-4">Gia sư</th>
                    <th className="py-3.5 px-4">Môn & Lớp</th>
                    <th className="py-3.5 px-4 text-right">Học phí</th>
                    <th className="py-3.5 px-4 text-center">Buổi</th>
                    <th className="py-3.5 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                  {filteredCourses.map((course) => (
                    <tr key={course.idKhoaHoc} className="hover:bg-gray-50/60 transition-colors">

                      {/* Cột: Ảnh + Tên + Mã */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {course.anhMinhHoa ? (
                            <img
                              src={course.anhMinhHoa}
                              alt={course.tenKhoaHoc}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-[#4A7766]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen size={18} className="text-[#4A7766]" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-800 line-clamp-1">{course.tenKhoaHoc}</div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">{course.idKhoaHoc}</div>
                          </div>
                        </div>
                      </td>

                      {/* Cột: Gia sư */}
                      <td className="py-3.5 px-4 text-gray-600">{course.tenGiaSu}</td>

                      {/* Cột: Môn & Lớp */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 bg-[#4A7766]/10 text-[#4A7766] text-xs rounded-md font-medium">{course.tenMonHoc}</span>
                        <span className="text-xs text-gray-400 ml-2">{course.tenLop}</span>
                      </td>

                      {/* Cột: Học phí */}
                      <td className="py-3.5 px-4 text-right font-semibold text-gray-800">
                        {formatCurrency(course.soTienHoc)}
                      </td>

                      {/* Cột: Số buổi */}
                      <td className="py-3.5 px-4 text-center text-gray-500">{course.soBuoiHoc}</td>

                      {/* Cột: Thao tác */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {course.trangThai === 0 && (
                            <>
                              <button
                                onClick={() => handleApproval(course.idKhoaHoc, 1)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors"
                                title="Phê duyệt"
                              >
                                <Check size={13} /> Duyệt
                              </button>
                              <button
                                onClick={() => handleApproval(course.idKhoaHoc, 2)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                                title="Từ chối"
                              >
                                <X size={13} /> Từ chối
                              </button>
                            </>
                          )}
                          {course.trangThai === 1 && (
                            <button
                              onClick={() => handleSoftDelete(course.idKhoaHoc)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                              title="Ẩn khóa học"
                            >
                              <Trash2 size={13} /> Ẩn
                            </button>
                          )}
                          {course.trangThai === -1 && (
                            <button
                              onClick={() => handleApproval(course.idKhoaHoc, 1)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                            >
                              <RotateCcw size={13} /> Khôi phục
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-gray-400 text-sm">
                        <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                        Không có khóa học nào trong mục này.
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