// component/ClassesTab.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, CheckCircle2, Clock4, XCircle, Loader2 } from 'lucide-react';
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

  const pieData = [
    { name: 'Đã nhận lớp', value: 326, color: '#10b981' }, 
    { name: 'Đang xử lý', value: 90, color: '#f59e0b' },   
    { name: 'Đã hủy', value: 26, color: '#ef4444' },       
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 4 Thẻ Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-purple-200 border-l-4 border-l-purple-500 shadow-sm relative overflow-hidden">
          <div className="flex items-center text-gray-500 mb-1 text-sm"><Clock size={16} className="mr-2"/> Tổng yêu cầu</div>
          <div className="text-2xl font-bold text-purple-600">442</div>
          <div className="text-xs text-gray-400 mt-1">6 tháng đầu năm</div>
          <div className="absolute top-4 right-4 bg-purple-50 p-2 rounded-full text-purple-400"><Clock size={20}/></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 border-l-4 border-l-emerald-500 shadow-sm relative overflow-hidden">
          <div className="flex items-center text-gray-500 mb-1 text-sm"><CheckCircle2 size={16} className="mr-2"/> Đã nhận lớp</div>
          <div className="text-2xl font-bold text-emerald-500">326</div>
          <div className="text-xs text-emerald-500 mt-1">~ Tỷ lệ 73.8%</div>
          <div className="absolute top-4 right-4 bg-emerald-50 p-2 rounded-full text-emerald-400"><CheckCircle2 size={20}/></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 border-l-4 border-l-amber-500 shadow-sm relative overflow-hidden">
          <div className="flex items-center text-gray-500 mb-1 text-sm"><Clock4 size={16} className="mr-2"/> Đang xử lý</div>
          <div className="text-2xl font-bold text-amber-500">90</div>
          <div className="text-xs text-gray-400 mt-1">Chờ phân công</div>
          <div className="absolute top-4 right-4 bg-amber-50 p-2 rounded-full text-amber-400"><Clock4 size={20}/></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-200 border-l-4 border-l-red-500 shadow-sm relative overflow-hidden">
          <div className="flex items-center text-gray-500 mb-1 text-sm"><XCircle size={16} className="mr-2"/> Đã hủy</div>
          <div className="text-2xl font-bold text-red-500">26</div>
          <div className="text-xs text-red-500 mt-1">~ Tỷ lệ 5.9%</div>
          <div className="absolute top-4 right-4 bg-red-50 p-2 rounded-full text-red-400"><XCircle size={20}/></div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Biểu đồ chi tiết theo tháng</h2>
          <p className="text-sm text-gray-500 mb-6">Theo dõi xu hướng xử lý yêu cầu tìm gia sư qua từng tháng</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} barSize={35} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="daNhan" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} /> 
                <Bar dataKey="dangXuLy" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="daHuy" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
            <div className="flex items-center"><span className="w-3 h-3 bg-emerald-500 mr-2 rounded-sm"></span> Đã nhận lớp</div>
            <div className="flex items-center"><span className="w-3 h-3 bg-amber-500 mr-2 rounded-sm"></span> Đang xử lý</div>
            <div className="flex items-center"><span className="w-3 h-3 bg-red-500 mr-2 rounded-sm"></span> Đã hủy</div>
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
            <div className="flex justify-between items-center"><div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span><span className="text-gray-600">Đã nhận lớp</span></div><span className="font-medium text-gray-800">326 (73.8%)</span></div>
            <div className="flex justify-between items-center"><div className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span><span className="text-gray-600">Đang xử lý</span></div><span className="font-medium text-gray-800">90 (20.4%)</span></div>
            <div className="flex justify-between items-center"><div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span><span className="text-gray-600">Đã hủy</span></div><span className="font-medium text-gray-800">26 (5.9%)</span></div>
          </div>
        </div>
      </div>

      {/* MÌNH ĐÃ GẮN LẠI BẢNG DỮ LIỆU CHI TIẾT VÀO ĐÂY */}
      <div className="bg-white p-6 rounded-xl border border-purple-300 shadow-sm overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Báo cáo lượt nhận lớp chi tiết</h2>
        <p className="text-sm text-gray-500 mb-4">Thống kê tình trạng xử lý yêu cầu tìm gia sư theo tháng với thời gian xử lý trung bình</p>
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-600 bg-gray-50/50">
              <th className="py-3 px-4 font-medium">Thời gian</th>
              <th className="py-3 px-4 font-medium text-center">Tổng yêu cầu</th>
              <th className="py-3 px-4 font-medium text-center">Đã nhận lớp</th>
              <th className="py-3 px-4 font-medium text-center">Đang xử lý</th>
              <th className="py-3 px-4 font-medium text-center">Đã hủy</th>
              <th className="py-3 px-4 font-medium text-center">Tỷ lệ thành công</th>
              <th className="py-3 px-4 font-medium text-right">TG xử lý TB</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              { t: 'Tháng 1/2026', total: 57, dnl: 42, dxl: 12, dh: 3, tl: '73.7%', tg: '2.5 ngày' },
              { t: 'Tháng 2/2026', total: 62, dnl: 48, dxl: 10, dh: 4, tl: '77.4%', tg: '2.1 ngày' },
              { t: 'Tháng 3/2026', total: 78, dnl: 55, dxl: 18, dh: 5, tl: '70.5%', tg: '3.2 ngày' },
              { t: 'Tháng 4/2026', total: 69, dnl: 51, dxl: 14, dh: 4, tl: '73.9%', tg: '2.8 ngày' },
              { t: 'Tháng 5/2026', total: 86, dnl: 62, dxl: 20, dh: 4, tl: '72.1%', tg: '3.5 ngày' },
              { t: 'Tháng 6/2026', total: 90, dnl: 68, dxl: 16, dh: 6, tl: '75.6%', tg: '2.9 ngày' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">{row.t}</td>
                <td className="py-3 px-4 text-center text-gray-600">{row.total}</td>
                <td className="py-3 px-4 text-center text-emerald-600 flex items-center justify-center gap-1"><CheckCircle2 size={14}/> {row.dnl}</td>
                <td className="py-3 px-4 text-center text-amber-600"><div className="flex items-center justify-center gap-1"><Clock4 size={14}/> {row.dxl}</div></td>
                <td className="py-3 px-4 text-center text-red-600"><div className="flex items-center justify-center gap-1"><XCircle size={14}/> {row.dh}</div></td>
                <td className="py-3 px-4 text-center text-gray-600">{row.tl}</td>
                <td className="py-3 px-4 text-right text-gray-500">{row.tg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}