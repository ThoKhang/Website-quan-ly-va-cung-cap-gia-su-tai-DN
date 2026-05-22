// app/dashboard/page.tsx
'use client'; 

import React, { useState } from 'react';
import RevenueTab from '../../../component/RevenueTab';
import ClassesTab from '../../../component/ClassesTab';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'classes'>('revenue');

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Báo cáo & Thống kê</h1>
          <p className="text-gray-500 text-sm mt-1">Hệ thống quản lý và cung cấp gia sư - Đà Nẵng</p>
        </div>

        {/* Nút Tabs */}
        <div className="flex space-x-1 mb-8 bg-white w-fit p-1 rounded-full border border-gray-200 shadow-sm">
          <button 
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'revenue' 
                ? 'bg-white shadow-sm border border-gray-200 text-gray-800' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('revenue')}
          >
            Thống kê doanh thu
          </button>
          <button 
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'classes' 
                ? 'bg-white shadow-sm border border-gray-200 text-gray-800' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('classes')}
          >
            Thống kê lượt nhận lớp
          </button>
        </div>

        {/* Nội dung Tab */}
        <div className="mt-4">
          {activeTab === 'revenue' ? <RevenueTab /> : <ClassesTab />}
        </div>
      </div>
    </div>
  );
}