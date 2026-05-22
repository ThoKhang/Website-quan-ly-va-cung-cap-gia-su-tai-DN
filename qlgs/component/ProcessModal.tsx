'use client';

import React, { useState } from 'react';
import { X, UserCheck, GraduationCap, ArrowRight } from 'lucide-react';

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// DÒNG NÀY CỰC KỲ QUAN TRỌNG: export default
export default function ProcessModal({ isOpen, onClose }: ProcessModalProps) {
  const [activeTab, setActiveTab] = useState<'phuhuynh' | 'giasu'>('phuhuynh');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/80">
          <h2 className="text-xl font-bold text-gray-800">Quy trình cung cấp & nhận gia sư</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <X size={22} />
          </button>
        </div>

        <div className="flex px-6 pt-4 border-b border-gray-100 gap-8 bg-white">
          <button
            onClick={() => setActiveTab('phuhuynh')}
            className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'phuhuynh' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <UserCheck size={20} /> Quy trình tìm gia sư
          </button>
          <button
            onClick={() => setActiveTab('giasu')}
            className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'giasu' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <GraduationCap size={20} /> Quy trình nhận lớp
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-white custom-scrollbar">
          {activeTab === 'phuhuynh' ? (
            <div className="space-y-6">
              <p className="text-sm text-gray-500 italic mb-4 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                Dành cho Phụ huynh / Học viên chủ động đưa ra yêu cầu để hệ thống tìm kiếm người dạy phù hợp.
              </p>
              <Step number={1} title="Đăng ký yêu cầu" desc="Phụ huynh điền form trực tuyến (Môn học, Lớp, Khu vực, Yêu cầu gia sư, Học phí dự kiến)." color="blue" />
              <Step number={2} title="Tư vấn và sàng lọc" desc="Nhân viên hệ thống tiếp nhận, liên hệ xác nhận và gửi profile gia sư phù hợp nhất." color="blue" />
              <Step number={3} title="Dạy thử" desc="Gia sư dạy thử 1-2 buổi. Nếu không đạt, hệ thống hỗ trợ đổi gia sư miễn phí." color="blue" />
              <Step number={4} title="Dạy chính thức" desc="Sau khi học thử thành công, hai bên thống nhất lịch học cố định và bắt đầu giảng dạy." color="blue" isLast />
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-gray-500 italic mb-4 bg-emerald-50 p-3 rounded-lg border-l-4 border-emerald-400">
                Dành cho người có nhu cầu đi dạy và muốn tìm lớp phù hợp.
              </p>
              <Step number={1} title="Đăng ký tài khoản" desc="Gia sư tạo tài khoản, điền thông tin cá nhân và upload minh chứng (CCCD, Bằng cấp)." color="emerald" />
              <Step number={2} title="Xét duyệt hồ sơ" desc="Hệ thống kiểm tra tính xác thực. Sau khi hợp lệ, tài khoản sẽ được kích hoạt." color="emerald" />
              <Step number={3} title="Đăng ký nhận lớp" desc="Gia sư chọn lớp phù hợp với năng lực và khoảng cách di chuyển." color="emerald" />
              <Step number={4} title="Đóng phí & nhận thông tin" desc="Gia sư đóng phí nhận lớp. Hệ thống cung cấp SĐT và địa chỉ phụ huynh." color="emerald" />
              <Step number={5} title="Liên hệ & Giảng dạy" desc="Gia sư gọi điện hẹn lịch gặp mặt và tiến hành dạy thử." color="emerald" isLast />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, desc, color, isLast = false }: any) {
  const bgColor = color === 'blue' ? 'bg-blue-600' : 'bg-emerald-600';
  const textColor = color === 'blue' ? 'text-blue-700' : 'text-emerald-700';
  const circleBg = color === 'blue' ? 'bg-blue-50' : 'bg-emerald-50';

  return (
    <div className="flex gap-5 relative">
      {!isLast && <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>}
      <div className={`w-10 h-10 rounded-full ${circleBg} ${textColor} flex items-center justify-center font-bold text-lg shrink-0 z-10 border-2 border-white shadow-sm`}>
        {number}
      </div>
      <div className="pb-4 pt-1">
        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
          {title} <ArrowRight size={14} className="text-gray-300" />
        </h3>
        <p className="text-gray-600 text-sm mt-1.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}