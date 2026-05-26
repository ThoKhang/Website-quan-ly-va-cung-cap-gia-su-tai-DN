// component/ClassesTab.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, CheckCircle2, GraduationCap, Users, Loader2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ClassStatsData } from '../types/dashboard';
import { dashboardService } from '../services/dashboardService';

export default function ClassesTab() {
  const [classData, setClassData] = useState<ClassStatsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApiData = async () => {
      setIsLoading(true);
      try {
        const data = await dashboardService.getClassStats();
        setClassData(data || []);
      } catch (error) {
        console.error("Lỗi fetch API lớp:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApiData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-purple-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu lượt nhận lớp...</p>
      </div>
    );
  }

  // ✅ Tính tổng từ dữ liệu API thật
  const tongYeuCau    = classData.reduce((sum, m) => sum + m.tongYeuCau,    0);
  const tongDaNhanLop = classData.reduce((sum, m) => sum + m.daNhanLop,     0);
  const tongDangHoc   = classData.reduce((sum, m) => sum + m.dangHoc,       0);
  const tongHoanThanh = classData.reduce((sum, m) => sum + m.daHoanThanh,   0);
  const tiLeDaNhan    = tongYeuCau > 0 ? ((tongDaNhanLop / tongYeuCau) * 100).toFixed(1) : '0';

  const pieData = [
    { name: 'Đã nhận lớp', value: tongDaNhanLop, color: '#10b981' },
    { name: 'Đang học',     value: tongDangHoc,   color: '#f59e0b' },
    { name: 'Đã hoàn thành',value: tongHoanThanh, color: '#6366f1' },
  ];

  // --- HÀM XUẤT EXCEL NHẬN LỚP ---
  const handleExportExcel = () => {
    const exportData = classData.map((row) => {
      const tiLe = row.tongYeuCau > 0 
        ? ((row.daNhanLop / row.tongYeuCau) * 100).toFixed(1) + '%' 
        : '0%';

      return {
        'Thời gian': row.name,
        'Tổng yêu cầu': row.tongYeuCau,
        'Đã nhận lớp': row.daNhanLop,
        'Đang học': row.dangHoc,
        'Đã hoàn thành': row.daHoanThanh,
        'Tỷ lệ nhận lớp': tiLe
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Luot Nhan Lop");
    
    const fileName = `Bao_Cao_Nhan_Lop_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 4 Thẻ Summary — dữ liệu thật */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-purple-200 border-l-4 border-l-purple-500 shadow-sm relative overflow-hidden">
          <div className="flex items-center text-gray-500 mb-1 text-sm"><Users size={16} className="mr-2"/> Tổng yêu cầu</div>
          <div className="text-2xl font-bold text-purple-600">{tongYeuCau}</div>
          <div className="text-xs text-gray-400 mt-1">Tất cả đăng ký</div>
          <div className="absolute top-4 right-4 bg-purple-50 p-2 rounded-full text-purple-400"><Users size={20}/></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 border-l-4 border-l-emerald-500 shadow-sm relative overflow-hidden">
          <div className="flex items-center text-gray-500 mb-1 text-sm"><CheckCircle2 size={16} className="mr-2"/> Đã nhận lớp</div>
          <div className="text-2xl font-bold text-emerald-500">{tongDaNhanLop}</div>
          <div className="text-xs text-emerald-500 mt-1">~ Tỷ lệ {tiLeDaNhan}%</div>
          <div className="absolute top-4 right-4 bg-emerald-50 p-2 rounded-full text-emerald-400"><CheckCircle2 size={20}/></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 border-l-4 border-l-amber-500 shadow-sm relative overflow-hidden">
          <div className="flex items-center text-gray-500 mb-1 text-sm"><BookOpen size={16} className="mr-2"/> Đang học</div>
          <div className="text-2xl font-bold text-amber-500">{tongDangHoc}</div>
          <div className="text-xs text-gray-400 mt-1">Đang trong khóa học</div>
          <div className="absolute top-4 right-4 bg-amber-50 p-2 rounded-full text-amber-400"><BookOpen size={20}/></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-indigo-200 border-l-4 border-l-indigo-500 shadow-sm relative overflow-hidden">
          <div className="flex items-center text-gray-500 mb-1 text-sm"><GraduationCap size={16} className="mr-2"/> Đã hoàn thành</div>
          <div className="text-2xl font-bold text-indigo-500">{tongHoanThanh}</div>
          <div className="text-xs text-indigo-500 mt-1">
            ~ Tỷ lệ {tongYeuCau > 0 ? ((tongHoanThanh / tongYeuCau) * 100).toFixed(1) : '0'}%
          </div>
          <div className="absolute top-4 right-4 bg-indigo-50 p-2 rounded-full text-indigo-400"><GraduationCap size={20}/></div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Biểu đồ chi tiết theo tháng</h2>
          <p className="text-sm text-gray-500 mb-6">Theo dõi xu hướng xử lý yêu cầu tìm gia sư qua từng tháng</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {/* ✅ dataKey khớp đúng với ClassStatsData */}
              <BarChart data={classData} barSize={35} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="daNhanLop"   stackId="a" name="Đã nhận lớp"   fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="dangHoc"     stackId="a" name="Đang học"       fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="daHoanThanh" stackId="a" name="Đã hoàn thành" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
            <div className="flex items-center"><span className="w-3 h-3 bg-emerald-500 mr-2 rounded-sm"></span> Đã nhận lớp</div>
            <div className="flex items-center"><span className="w-3 h-3 bg-amber-500 mr-2 rounded-sm"></span> Đang học</div>
            <div className="flex items-center"><span className="w-3 h-3 bg-indigo-500 mr-2 rounded-sm"></span> Đã hoàn thành</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Tỷ lệ phân bổ</h2>
          <p className="text-sm text-gray-500 mb-2">Tổng quan tỷ lệ xử lý yêu cầu</p>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span><span className="text-gray-600">Đã nhận lớp</span></div>
              <span className="font-medium text-gray-800">{tongDaNhanLop} ({tiLeDaNhan}%)</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span><span className="text-gray-600">Đang học</span></div>
              <span className="font-medium text-gray-800">
                {tongDangHoc} ({tongYeuCau > 0 ? ((tongDangHoc / tongYeuCau) * 100).toFixed(1) : '0'}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span><span className="text-gray-600">Đã hoàn thành</span></div>
              <span className="font-medium text-gray-800">
                {tongHoanThanh} ({tongYeuCau > 0 ? ((tongHoanThanh / tongYeuCau) * 100).toFixed(1) : '0'}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng chi tiết theo tháng — dữ liệu thật từ API */}
      <div className="bg-white p-6 rounded-xl border border-purple-300 shadow-sm overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Báo cáo lượt nhận lớp chi tiết</h2>
            <p className="text-sm text-gray-500">Thống kê tình trạng xử lý yêu cầu tìm gia sư theo tháng</p>
          </div>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors border border-purple-200"
          >
            <Download size={18} />
            Xuất Excel
          </button>
        </div>
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-600 bg-gray-50/50">
              <th className="py-3 px-4 font-medium">Thời gian</th>
              <th className="py-3 px-4 font-medium text-center">Tổng yêu cầu</th>
              <th className="py-3 px-4 font-medium text-center">Đã nhận lớp</th>
              <th className="py-3 px-4 font-medium text-center">Đang học</th>
              <th className="py-3 px-4 font-medium text-center">Đã hoàn thành</th>
              <th className="py-3 px-4 font-medium text-center">Tỷ lệ nhận lớp</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {classData.map((row, i) => {
              const tl = row.tongYeuCau > 0
                ? ((row.daNhanLop / row.tongYeuCau) * 100).toFixed(1)
                : '0';
              return (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-700">{row.name}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{row.tongYeuCau}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-600">
                      <CheckCircle2 size={14}/> {row.daNhanLop}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-600">
                      <BookOpen size={14}/> {row.dangHoc}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-indigo-600">
                      <GraduationCap size={14}/> {row.daHoanThanh}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">{tl}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}