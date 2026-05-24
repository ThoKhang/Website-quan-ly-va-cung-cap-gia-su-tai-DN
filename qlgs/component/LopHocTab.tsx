"use client";

import React, { useState, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';
import { Button, Card, Text } from "@/component/ui";

interface LopDangDay {
  idDangKy: string;
  idHocVien: string;
  tenHocVien: string;
  tenPhuHuynh: string;
  sdtPhuHuynh: string;
  tenKhoaHoc: string;
  ngayBatDauHoc: string;
  ngayKetThucDuKien: string;
  ngayGiaHan?: string;
  loaiDangKy: string; 
  trangThaiHoanThanh: boolean;
}

export default function LopHocTab() {
  const [danhSachLop, setDanhSachLop] = useState<LopDangDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDanhSachLop = async () => {
    setLoading(true);
    try {
      const data: any = await axiosClient.get('/gia-su/lop-dang-day'); 
      setDanhSachLop(data || []);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDanhSachLop();
  }, []);

  const handleXuLyGiaHan = async (idDangKy: string, isDongY: boolean) => {
    if (!confirm(`Bạn chắc chắn muốn ${isDongY ? 'ĐỒNG Ý' : 'TỪ CHỐI'} gia hạn?`)) return;
    try {
      await axiosClient.put(`/gia-su/gia-han/${idDangKy}?isDongY=${isDongY}`);
      fetchDanhSachLop();
    } catch (err: any) {
      alert(err || "Lỗi xử lý");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const lopGiaHan = danhSachLop.filter(l => l.loaiDangKy === 'Yêu cầu gia hạn');
  const lopBinhThuong = danhSachLop.filter(l => l.loaiDangKy !== 'Yêu cầu gia hạn');

  if (loading) {
    return <div className="py-20 text-center text-[#718096]">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* YÊU CẦU GIA HẠN */}
      {lopGiaHan.length > 0 && (
        <div className="bg-[#fff5f5] p-8 border border-[#fed7d7] rounded-2xl shadow-sm">
          <Text as="h2" size="title" className="font-bold text-[#c53030] mb-6 flex items-center gap-2">
            ⚠️ Cần duyệt gia hạn ({lopGiaHan.length})
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lopGiaHan.map(lop => (
              <Card key={lop.idDangKy} className="p-6 border border-[#feb2b2] bg-white shadow-sm flex flex-col justify-between h-full">
                <div>
                  <Text className="font-bold text-lg mb-4 text-[#2d3748] leading-snug">{lop.tenKhoaHoc}</Text>
                  <div className="space-y-2 mb-6 text-sm text-[#4a5568] bg-[#f7fafc] p-4 rounded-xl border border-[#e2e8f0]">
                    <p className="flex justify-between"><span>Học viên:</span> <span className="font-bold text-[#2d3748]">{lop.tenHocVien}</span></p>
                    <p className="flex justify-between"><span>Liên hệ PH:</span> <span className="font-bold text-[#4A7766]">{lop.sdtPhuHuynh}</span></p>
                    <hr className="my-2 border-[#e2e8f0]"/>
                    <p className="flex justify-between"><span>Ngày kết thúc cũ:</span> <span className="line-through text-[#a0aec0]">{formatDate(lop.ngayKetThucDuKien)}</span></p>
                    <p className="flex justify-between mt-1 font-bold"><span>Gia hạn đến:</span> <span className="text-[#e53e3e]">{formatDate(lop.ngayGiaHan)}</span></p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => handleXuLyGiaHan(lop.idDangKy, true)} className="flex-1 bg-[#48bb78] hover:bg-[#38a169] text-white font-bold py-3 rounded-xl">✓ Đồng ý</Button>
                  <Button variant="secondary" onClick={() => handleXuLyGiaHan(lop.idDangKy, false)} className="flex-1 bg-white text-[#e53e3e] border border-[#fc8181] hover:bg-[#fff5f5] font-bold py-3 rounded-xl">✕ Từ chối</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* LỚP ĐANG DẠY */}
      <div>
        <Text as="h2" size="title" className="font-bold text-[#2d3748] mb-6">Lớp đang phụ trách ({lopBinhThuong.length})</Text>
        {lopBinhThuong.length === 0 ? (
           <div className="p-16 text-center border-2 border-dashed border-[#e2e8f0] rounded-2xl bg-white">
             <Text tone="muted" className="text-lg font-medium">Bạn chưa phụ trách lớp nào.</Text>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lopBinhThuong.map(lop => (
              <Card key={lop.idDangKy} className="p-6 flex flex-col justify-between bg-white border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="mb-4">
                    <span className="text-[11px] font-bold bg-[#e6fffa] text-[#2c7a7b] px-3 py-1.5 rounded-md uppercase border border-[#b2f5ea]">
                      {lop.loaiDangKy || 'Đang dạy'}
                    </span>
                  </div>
                  <Text className="font-bold text-[17px] mb-4 text-[#2d3748] leading-snug line-clamp-2" title={lop.tenKhoaHoc}>
                    {lop.tenKhoaHoc}
                  </Text>
                  <div className="text-sm space-y-2 mb-6">
                    <p className="flex justify-between text-[#718096]"><span>Học viên:</span> <span className="text-[#2d3748] font-bold">{lop.tenHocVien}</span></p>
                    <p className="flex justify-between text-[#718096]"><span>Liên hệ:</span> <span className="text-[#2d3748] font-bold">{lop.sdtPhuHuynh}</span></p>
                  </div>
                </div>
                <div className="bg-[#f8f9fa] p-4 rounded-xl text-xs font-medium text-[#4a5568] border border-[#e2e8f0]">
                  <div className="flex justify-between mb-1.5"><span>Bắt đầu:</span> <span className="font-bold text-[#2d3748]">{formatDate(lop.ngayBatDauHoc)}</span></div>
                  <div className="flex justify-between"><span>Kết thúc dự kiến:</span> <span className="font-bold text-[#2d3748]">{formatDate(lop.ngayKetThucDuKien)}</span></div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}