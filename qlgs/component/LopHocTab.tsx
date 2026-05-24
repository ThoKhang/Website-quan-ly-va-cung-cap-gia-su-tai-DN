"use client";

import React, { useState, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';
import { Button, Card, Text } from "@/component/ui";
import { BookOpen, AlertCircle, CheckCircle2, XCircle, CalendarClock, User, Phone, Loader2 } from 'lucide-react';

interface LopDangDay {
  idDangKy: string;
  idHocVien: string;
  tenHocVien: string;
  tenPhuHuynh: string;
  sdtPhuHuynh: string;
  tenKhoaHoc: string;
  ngayBatDauHoc: string;
  ngayKetThucDuKien: string;
  loaiDangKy: string; 
  trangThaiHoanThanh: boolean;
}

interface DonGiaHan {
  idGiaHan: string;
  idDangKy: string;
  tenKhoaHoc: string;
  tenHocVien: string;
  sdtPhuHuynh: string;
  soBuoiGiaHan: number;
  loaiGiaHan: string;
  ngayKetThucCu: string;
  ngayYeuCau: string;
}

export default function LopHocTab() {
  const [danhSachLop, setDanhSachLop] = useState<LopDangDay[]>([]);
  const [danhSachDon, setDanhSachDon] = useState<DonGiaHan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi đồng thời cả 2 luồng dữ liệu riêng biệt
      const [lopRes, donRes]: any = await Promise.all([
        axiosClient.get('/gia-su/lop-dang-day'),
        axiosClient.get('/gia-su/don-gia-han/cho-duyet')
      ]);
      setDanhSachLop(lopRes || []);
      setDanhSachDon(donRes || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu lớp học:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleXuLyDon = async (idGiaHan: string, isDongY: boolean) => {
    if (!confirm(`Bạn chắc chắn muốn ${isDongY ? 'ĐỒNG Ý' : 'TỪ CHỐI'} đơn xin gia hạn này?`)) return;
    try {
      await axiosClient.put(`/gia-su/don-gia-han/${idGiaHan}/xu-ly?isDongY=${isDongY}`);
      fetchData(); // Tải lại toàn bộ dữ liệu sau khi duyệt xong
    } catch (err: any) {
      alert(err || "Lỗi hệ thống");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-indigo-600">
        <Loader2 className="animate-spin" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      
      {/* 1. KHU VỰC ĐƠN XIN GIA HẠN CHỜ DUYỆT (BẢNG MỚI YEUCAUGIAHAN) */}
      {danhSachDon.length > 0 && (
        <div className="bg-[#fff5f5] p-6 md:p-8 border border-red-100 rounded-3xl shadow-sm ring-1 ring-red-500/5">
          <Text as="h2" size="title" className="font-extrabold text-[#c53030] mb-6 flex items-center gap-2">
            <AlertCircle size={22} /> Đơn xin gia hạn đang chờ bạn duyệt ({danhSachDon.length})
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {danhSachDon.map(don => (
              <Card key={don.idGiaHan} className="p-6 bg-white border border-red-200/60 shadow-md shadow-red-100/30 rounded-2xl flex flex-col justify-between h-full transform hover:-translate-y-0.5 transition-all">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md border border-amber-200">
                      Gia hạn: {don.loaiGiaHan}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Gửi: {formatDate(don.ngayYeuCau)}</span>
                  </div>
                  
                  <Text className="font-bold text-lg text-slate-900 leading-snug mb-4">{don.tenKhoaHoc}</Text>
                  
                  <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-5">
                    <p className="flex justify-between"><span>Học viên:</span> <span className="font-bold text-slate-800">{don.tenHocVien}</span></p>
                    <p className="flex justify-between"><span>Số điện thoại PH:</span> <span className="font-semibold text-[#4A7766]">{don.sdtPhuHuynh}</span></p>
                    <hr className="my-2 border-slate-200/60"/>
                    <p className="flex justify-between"><span>Ngày kết thúc cũ:</span> <span className="text-slate-500">{formatDate(don.ngayKetThucCu)}</span></p>
                    <p className="flex justify-between mt-1 font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                      <span>Mua thêm số buổi:</span> <span>+{don.soBuoiGiaHan} buổi</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleXuLyDon(don.idGiaHan, true)} 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 size={16} /> Đồng ý
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => handleXuLyDon(don.idGiaHan, false)} 
                    className="flex-1 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 font-bold py-3 rounded-xl flex items-center justify-center gap-1"
                  >
                    <XCircle size={16} /> Từ chối
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 2. KHU VỰC DANH SÁCH LỚP HỌC ĐANG PHỤ TRÁCH (BẢNG DANGKYHOC) */}
      <div>
        <Text as="h2" size="title" className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BookOpen size={22} className="text-indigo-600" /> Danh sách lớp đang phụ trách ({danhSachLop.length})
        </Text>
        
        {danhSachLop.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-slate-200 rounded-2xl bg-white text-slate-400 font-medium">
            Hiện tại bạn chưa có lớp học nào đang diễn ra.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {danhSachLop.map(lop => (
              <Card key={lop.idDangKy} className="p-6 flex flex-col justify-between bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all rounded-2xl">
                <div>
                  <div className="mb-4">
                    <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md uppercase border border-slate-200">
                      {lop.loaiDangKy || 'Đang dạy'}
                    </span>
                  </div>
                  <Text className="font-bold text-[17px] mb-4 text-slate-800 leading-snug line-clamp-2" title={lop.tenKhoaHoc}>
                    {lop.tenKhoaHoc}
                  </Text>
                  <div className="text-sm space-y-2 mb-6">
                    <p className="flex justify-between text-slate-500"><span>Học viên:</span> <span className="text-slate-800 font-bold">{lop.tenHocVien}</span></p>
                    <p className="flex justify-between text-slate-500"><span>Phụ huynh:</span> <span className="text-slate-800 font-semibold">{lop.tenPhuHuynh}</span></p>
                    <p className="flex justify-between text-slate-500"><span>Liên hệ:</span> <span className="text-indigo-600 font-bold">{lop.sdtPhuHuynh}</span></p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-xs font-medium text-slate-600 border border-slate-100">
                  <div className="flex justify-between mb-1.5"><span>Bắt đầu từ ngày:</span> <span className="font-bold text-slate-800">{formatDate(lop.ngayBatDauHoc)}</span></div>
                  <div className="flex justify-between"><span>Kết thúc dự kiến:</span> <span className="font-bold text-slate-800">{formatDate(lop.ngayKetThucDuKien)}</span></div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}