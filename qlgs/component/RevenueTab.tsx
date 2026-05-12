// component/RevenueTab.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Calendar, Clock, Loader2 } from 'lucide-react';
import { RevenueData } from '../types/dashboard';
import { dashboardService } from '../services/dashboardService';

export default function RevenueTab() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApiData = async () => {
      setIsLoading(true);
      try {
        const data = await dashboardService.getRevenueStats();
        setRevenueData(data || []);
      } catch (error) {
        console.error("Lỗi fetch API doanh thu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-blue-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="text-gray-500 font-medium">Đang tải dữ liệu doanh thu từ hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 4 Thẻ Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center text-gray-500 mb-2 text-sm"><DollarSign size={16} className="mr-2"/> Tổng doanh thu</div>
          <div className="text-2xl font-bold text-blue-600">1021.5M</div>
          <div className="text-xs text-gray-400 mt-1">6 tháng đầu năm</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-teal-200 border-l-4 border-l-teal-500 shadow-sm">
          <div className="flex items-center text-gray-500 mb-2 text-sm"><TrendingUp size={16} className="mr-2"/> Tăng trưởng</div>
          <div className="text-2xl font-bold text-teal-500">+34.5%</div>
          <div className="text-xs text-gray-400 mt-1">So với T1/2026</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-200 border-l-4 border-l-blue-500 shadow-sm">
          <div className="flex items-center text-gray-500 mb-2 text-sm"><Calendar size={16} className="mr-2"/> Doanh thu TB/tháng</div>
          <div className="text-2xl font-bold text-blue-500">170.3M</div>
          <div className="text-xs text-gray-400 mt-1">Trung bình</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center text-gray-500 mb-2 text-sm"><Clock size={16} className="mr-2"/> Tháng hiện tại</div>
          <div className="text-2xl font-bold text-blue-600">195.0M</div>
          <div className="text-xs text-green-500 mt-1 flex items-center">↗ +5.4% so với T5</div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="bg-white p-6 rounded-xl border border-blue-500 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Biểu đồ doanh thu 6 tháng đầu năm</h2>
        <p className="text-sm text-gray-500 mb-6">So sánh doanh thu thực tế với mục tiêu đề ra</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} barSize={45} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} tickFormatter={(value) => `${value}M`} />
              <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="doanhThu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white p-6 rounded-xl border border-blue-500 shadow-sm overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Báo cáo doanh thu chi tiết</h2>
        <p className="text-sm text-gray-500 mb-4">Thống kê doanh thu theo tháng với hoa hồng 10% và tỷ lệ tăng trưởng</p>
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-600 bg-gray-50/50">
              <th className="py-3 px-4 font-medium">Thời gian</th>
              <th className="py-3 px-4 font-medium text-center">Số lớp</th>
              <th className="py-3 px-4 font-medium text-right">Tổng doanh thu</th>
              <th className="py-3 px-4 font-medium text-right">Hoa hồng (10%)</th>
              <th className="py-3 px-4 font-medium text-right">Doanh thu thuần</th>
              <th className="py-3 px-4 font-medium text-right">Tăng trưởng</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              { t: 'Tháng 1/2026', l: 42, dt: '145.000.000 đ', hh: '14.500.000 đ', dtt: '130.500.000 đ', tang: '-' },
              { t: 'Tháng 2/2026', l: 48, dt: '158.000.000 đ', hh: '15.800.000 đ', dtt: '142.200.000 đ', tang: '↗ +9%', c: 'text-green-500' },
              { t: 'Tháng 3/2026', l: 55, dt: '172.000.000 đ', hh: '17.200.000 đ', dtt: '154.800.000 đ', tang: '↗ +8.9%', c: 'text-green-500' },
              { t: 'Tháng 4/2026', l: 51, dt: '165.000.000 đ', hh: '16.500.000 đ', dtt: '148.500.000 đ', tang: '↘ -4.1%', c: 'text-red-500' },
              { t: 'Tháng 5/2026', l: 62, dt: '186.500.000 đ', hh: '18.650.000 đ', dtt: '167.850.000 đ', tang: '↗ +13%', c: 'text-green-500' },
              { t: 'Tháng 6/2026', l: 68, dt: '195.000.000 đ', hh: '19.500.000 đ', dtt: '175.500.000 đ', tang: '↗ +4.6%', c: 'text-green-500' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">{row.t}</td>
                <td className="py-3 px-4 text-center text-gray-600">{row.l}</td>
                <td className="py-3 px-4 text-right text-gray-700">{row.dt}</td>
                <td className="py-3 px-4 text-right text-gray-400">{row.hh}</td>
                <td className="py-3 px-4 text-right font-medium text-gray-800">{row.dtt}</td>
                <td className={`py-3 px-4 text-right font-medium ${row.c || 'text-gray-400'}`}>{row.tang}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}