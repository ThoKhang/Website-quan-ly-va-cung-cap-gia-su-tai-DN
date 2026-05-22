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

  // --- HELPER FUNCTION: FORMAT CURRENCY ---
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatMillions = (value: number) => {
    return (value / 1000000).toFixed(1) + 'M';
  };

  // --- TÍNH TOÁN DỮ LIỆU TỪ API TRẢ VỀ ---
  // Tổng doanh thu tất cả các tháng
  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.doanhThu || 0), 0);
  
  // Doanh thu trung bình mỗi tháng
  const averageRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

  // Xử lý dữ liệu tháng hiện tại và tháng trước đó để tính tăng trưởng
  let currentMonthRevenue = 0;
  let previousMonthRevenue = 0;
  let firstMonthRevenue = 0;
  let growthFromFirstMonth = 0;
  let growthFromLastMonth = 0;

  if (revenueData.length > 0) {
    const currentMonthData = revenueData[revenueData.length - 1];
    currentMonthRevenue = currentMonthData.doanhThu || 0;
    
    firstMonthRevenue = revenueData[0].doanhThu || 0;
    
    if (revenueData.length > 1) {
      previousMonthRevenue = revenueData[revenueData.length - 2].doanhThu || 0;
    }

    // Tăng trưởng so với tháng đầu tiên (T1)
    if (firstMonthRevenue > 0) {
      growthFromFirstMonth = ((currentMonthRevenue - firstMonthRevenue) / firstMonthRevenue) * 100;
    }

    // Tăng trưởng so với tháng trước
    if (previousMonthRevenue > 0) {
      growthFromLastMonth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    }
  }

  // Tạo dữ liệu cho bảng, kèm theo tính toán tăng trưởng từng dòng
  const tableData = revenueData.map((row, index) => {
    let growthStr = '-';
    let growthClass = 'text-gray-400';
    
    if (index > 0) {
      const prevRevenue = revenueData[index - 1].doanhThu;
      if (prevRevenue > 0) {
        const growth = ((row.doanhThu - prevRevenue) / prevRevenue) * 100;
        const sign = growth >= 0 ? '↗ +' : '↘ ';
        growthStr = `${sign}${growth.toFixed(1)}%`;
        growthClass = growth >= 0 ? 'text-green-500' : 'text-red-500';
      }
    }

    // Giả sử hoa hồng là 10%
    const hoaHong = row.doanhThu * 0.10;
    const doanhThuThuan = row.doanhThu - hoaHong;

    return {
      t: row.name,
      l: row.soLop || 0, // Cần thêm trường soLop vào RevenueData DTO bên backend nếu muốn hiển thị
      dt: formatCurrency(row.doanhThu),
      hh: formatCurrency(hoaHong),
      dtt: formatCurrency(doanhThuThuan),
      tang: growthStr,
      c: growthClass
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 4 Thẻ Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center text-gray-500 mb-2 text-sm"><DollarSign size={16} className="mr-2"/> Tổng doanh thu</div>
          <div className="text-2xl font-bold text-blue-600">{formatMillions(totalRevenue)}</div>
          <div className="text-xs text-gray-400 mt-1">Toàn thời gian</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-teal-200 border-l-4 border-l-teal-500 shadow-sm">
          <div className="flex items-center text-gray-500 mb-2 text-sm"><TrendingUp size={16} className="mr-2"/> Tăng trưởng</div>
          <div className="text-2xl font-bold text-teal-500">
             {growthFromFirstMonth >= 0 ? '+' : ''}{growthFromFirstMonth.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">So với tháng đầu tiên</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-blue-200 border-l-4 border-l-blue-500 shadow-sm">
          <div className="flex items-center text-gray-500 mb-2 text-sm"><Calendar size={16} className="mr-2"/> Doanh thu TB/tháng</div>
          <div className="text-2xl font-bold text-blue-500">{formatMillions(averageRevenue)}</div>
          <div className="text-xs text-gray-400 mt-1">Trung bình</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center text-gray-500 mb-2 text-sm"><Clock size={16} className="mr-2"/> Tháng hiện tại</div>
          <div className="text-2xl font-bold text-blue-600">{formatMillions(currentMonthRevenue)}</div>
          <div className={`text-xs mt-1 flex items-center ${growthFromLastMonth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {growthFromLastMonth >= 0 ? '↗ +' : '↘ '}{growthFromLastMonth.toFixed(1)}% so với tháng trước
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="bg-white p-6 rounded-xl border border-blue-500 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Biểu đồ doanh thu chi tiết</h2>
        <p className="text-sm text-gray-500 mb-6">So sánh doanh thu thực tế qua các tháng</p>
        <div className="h-72">
          {/* Đã thêm minWidth và minHeight để tránh Warning của Recharts */}
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={revenueData} barSize={45} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#888', fontSize: 12}} 
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} 
              />
              <Tooltip 
                cursor={{fill: '#f3f4f6'}} 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                formatter={(value: any) => [formatCurrency(Number(value)), 'Doanh thu']}
              />
              <Bar dataKey="doanhThu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bảng dữ liệu tự động map từ dữ liệu tính toán ở trên */}
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
            {tableData.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">{row.t}</td>
                <td className="py-3 px-4 text-center text-gray-600">{row.l}</td>
                <td className="py-3 px-4 text-right text-gray-700">{row.dt}</td>
                <td className="py-3 px-4 text-right text-gray-400">{row.hh}</td>
                <td className="py-3 px-4 text-right font-medium text-gray-800">{row.dtt}</td>
                <td className={`py-3 px-4 text-right font-medium ${row.c || 'text-gray-400'}`}>{row.tang}</td>
              </tr>
            ))}
            
            {/* Hiển thị nếu mảng rỗng */}
            {tableData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">Chưa có dữ liệu thống kê trong khoảng thời gian này</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}