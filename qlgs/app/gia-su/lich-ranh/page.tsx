'use client'; 

import React, { useState } from 'react';
import LichRanhTab from '@/component/LichRanhTab'; 
import LopHocTab from '@/component/LopHocTab';     
import ThoiKhoaBieuTab from '@/component/ThoiKhoaBieuTab';
import { CalendarClock, GraduationCap, CalendarDays, Sparkles } from 'lucide-react';

export default function QuanLyLichVaLopPage() {
  const [activeTab, setActiveTab] = useState<'lichRanh' | 'lopHoc' | 'thoiKhoaBieu'>('lichRanh');

  return (
    // Thêm relative và overflow-hidden để chứa các hiệu ứng nền
    <div className="relative min-h-screen bg-[#f8fafc] font-sans text-slate-800 overflow-hidden">
      
      {/* HIỆU ỨNG NỀN GLOW BLOBS (MESH GRADIENT) */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/2 w-[800px] h-[500px] bg-blue-200/20 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/3 pointer-events-none"></div>

      {/* NỘI DUNG CHÍNH (Được đẩy lên trên lớp nền bằng z-10) */}
      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-10">
        
        {/* HEADER CAO CẤP */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Sparkles size={14} className="text-indigo-500" />
              <span>Cổng Thông Tin Gia Sư</span>
            </div>
            
            {/* Chữ đổ bóng Gradient */}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 pb-1">
              Trạm Quản Lý
            </h1>
            
            <p className="text-slate-500 font-medium mt-3 text-base max-w-2xl">
              Không gian làm việc tập trung. Dễ dàng khai báo thời gian rảnh, xem thời khóa biểu và theo dõi tiến độ các lớp học của bạn.
            </p>
          </div>
        </div>

        {/* NÚT TABS PHONG CÁCH "PILL" (MƯỢT MÀ, BO TRÒN) */}
        <div className="flex items-center p-1.5 bg-white/60 backdrop-blur-md rounded-2xl w-fit max-w-full overflow-x-auto shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] mb-10">
          
          <button 
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ease-out whitespace-nowrap ${
              activeTab === 'lichRanh' 
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
            onClick={() => setActiveTab('lichRanh')}
          >
            <CalendarClock size={18} strokeWidth={activeTab === 'lichRanh' ? 2.5 : 2} />
            Khai báo Lịch rảnh
          </button>

          <button 
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ease-out whitespace-nowrap ${
              activeTab === 'lopHoc' 
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
            onClick={() => setActiveTab('lopHoc')}
          >
            <GraduationCap size={18} strokeWidth={activeTab === 'lopHoc' ? 2.5 : 2} />
            Lớp đang dạy & Gia hạn
          </button>

          <button 
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ease-out whitespace-nowrap ${
              activeTab === 'thoiKhoaBieu' 
                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-900/5' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
            onClick={() => setActiveTab('thoiKhoaBieu')}
          >
            <CalendarDays size={18} strokeWidth={activeTab === 'thoiKhoaBieu' ? 2.5 : 2} />
            Thời khóa biểu
          </button>

        </div>

        {/* NỘI DUNG TABS KÈM HIỆU ỨNG MỜ DẦN VÀ TRƯỢT NHẸ */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          {activeTab === 'lichRanh' && <LichRanhTab />}
          {activeTab === 'lopHoc' && <LopHocTab />}
          {activeTab === 'thoiKhoaBieu' && <ThoiKhoaBieuTab />}
        </div>
        
      </div>
    </div>
  );
}