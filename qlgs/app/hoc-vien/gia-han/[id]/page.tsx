"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, Text } from "@/component/ui";
import { hocVienService } from "@/services/hoc-vien.service";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { PAYMENT_CONFIG } from "@/config/payment.config";

export default function GiaHanPage() {
  const router = useRouter();
  const params = useParams();
  const idDangKy = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [chiTietKhoaHoc, setChiTietKhoaHoc] = useState<any>(null);
  
  const [loaiGiaHan, setLoaiGiaHan] = useState<"Toàn bộ" | "Tùy chọn">("Toàn bộ");
  const [soBuoiGiaHan, setSoBuoiGiaHan] = useState<number>(0);

  const [trangThaiDon, setTrangThaiDon] = useState<"Chưa có" | "Chờ duyệt" | "Chờ thanh toán">("Chưa có");
  const [idGiaHanHienTai, setIdGiaHanHienTai] = useState("");

  useEffect(() => {
    fetchData();
  }, [idDangKy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await hocVienService.getCourseDetail(idDangKy); 
      setChiTietKhoaHoc(data);
      
      if (data?.soBuoiHoc) {
        setSoBuoiGiaHan(data.soBuoiHoc);
      }

      // Check trạng thái đơn gia hạn mới nhất nếu có tích hợp API kiểm tra đơn
      // const donGiaHan = await hocVienService.checkDonGiaHan(idDangKy);
      // if (donGiaHan) {
      //   if (donGiaHan.trangThai === "Chờ duyệt") setTrangThaiDon("Chờ duyệt");
      //   else if (donGiaHan.trangThai === "Chờ thanh toán") {
      //     setTrangThaiDon("Chờ thanh toán");
      //     setIdGiaHanHienTai(donGiaHan.idGiaHan);
      //     setSoBuoiGiaHan(donGiaHan.soBuoiGiaHan);
      //     setLoaiGiaHan(donGiaHan.loaiGiaHan);
      //   }
      // }

    } catch (err: any) {
      setError("Không thể tải thông tin khóa học.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuiYeuCau = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loaiGiaHan === "Tùy chọn" && (!soBuoiGiaHan || soBuoiGiaHan <= 0)) {
      setError("Vui lòng nhập số buổi hợp lệ!");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      await hocVienService.guiYeuCauGiaHan(idDangKy, {
        soBuoiGiaHan: loaiGiaHan === "Toàn bộ" ? chiTietKhoaHoc.soBuoiHoc : soBuoiGiaHan,
        loaiGiaHan: loaiGiaHan
      });

      setSuccess("Gửi yêu cầu thành công!");
      setTrangThaiDon("Chờ duyệt");
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleThanhToan = async () => {
    try {
      setSubmitting(true);
      setError("");
      
      const res: any = await hocVienService.xacNhanThanhToanGiaHan(idGiaHanHienTai);
      setSuccess(res.message || "Thanh toán thành công! Lịch học đã được cập nhật.");
      
      setTimeout(() => router.push("/hoc-vien/lich-su"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi xác nhận thanh toán.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  const donGia = chiTietKhoaHoc ? (chiTietKhoaHoc.soTienHoc / chiTietKhoaHoc.soBuoiHoc) : 0;
  const tongTienTamTinh = loaiGiaHan === "Toàn bộ" 
    ? chiTietKhoaHoc?.soTienHoc 
    : (soBuoiGiaHan * donGia);

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/hoc-vien/lich-su" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-6 transition-colors">
          <ArrowLeft size={18} /> Quay lại lịch sử
        </Link>

        <Card className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-100 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="text-purple-600" /> Gia hạn khóa học
            </h1>
            <p className="text-slate-500 mt-2">Khóa học: <span className="font-semibold text-slate-800">{chiTietKhoaHoc?.tenKhoaHoc}</span></p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2"><AlertCircle size={20}/> {error}</div>}
          {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2"><CheckCircle2 size={20}/> {success}</div>}

          {trangThaiDon === "Chưa có" && (
            <form onSubmit={handleGuiYeuCau} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option Toàn bộ */}
                <label className={`cursor-pointer rounded-2xl p-5 border-2 transition-all ${loaiGiaHan === "Toàn bộ" ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-200"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="loaiGiaHan" checked={loaiGiaHan === "Toàn bộ"} onChange={() => setLoaiGiaHan("Toàn bộ")} className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-900">Gia hạn toàn bộ</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 ml-7 mb-2">Học tiếp tục lộ trình chuẩn của Gia sư</p>
                  <div className="ml-7 bg-white/60 p-3 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium">+{chiTietKhoaHoc?.soBuoiHoc} buổi</p>
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(chiTietKhoaHoc?.soTienHoc)}</p>
                  </div>
                </label>

                {/* Option Tùy chọn */}
                <label className={`cursor-pointer rounded-2xl p-5 border-2 transition-all ${loaiGiaHan === "Tùy chọn" ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-200"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <input type="radio" name="loaiGiaHan" checked={loaiGiaHan === "Tùy chọn"} onChange={() => { setLoaiGiaHan("Tùy chọn"); setSoBuoiGiaHan(1); }} className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900">Tùy chọn số buổi</span>
                  </div>
                  <p className="text-sm text-slate-500 ml-7 mb-4">Chỉ đăng ký mua thêm vài buổi học</p>
                  
                  {loaiGiaHan === "Tùy chọn" && (
                    <div className="ml-7 space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Nhập số buổi muốn gia hạn:</label>
                        <input type="number" min="1" value={soBuoiGiaHan} onChange={(e) => setSoBuoiGiaHan(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      <div className="bg-white/60 p-3 rounded-lg border border-blue-100">
                        <p className="text-sm text-slate-500">Tạm tính ({formatCurrency(donGia)}/buổi)</p>
                        <p className="text-lg font-bold text-blue-700">{formatCurrency(tongTienTamTinh || 0)}</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={submitting} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md">
                  {submitting ? "Đang xử lý..." : "Gửi yêu cầu Gia hạn"}
                </Button>
              </div>
            </form>
          )}

          {trangThaiDon === "Chờ duyệt" && (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Đang chờ Gia sư xác nhận</h2>
              <p className="text-slate-500 max-w-md mx-auto">Yêu cầu gia hạn của bạn đã được gửi. Vui lòng đợi Gia sư phê duyệt, sau đó hệ thống sẽ mở cổng thanh toán cho bạn.</p>
            </div>
          )}

          {trangThaiDon === "Chờ thanh toán" && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
                <h3 className="text-lg font-bold text-blue-900 mb-1">Gia sư đã phê duyệt!</h3>
                <p className="text-blue-700 text-sm mb-4">Vui lòng quét mã QR bên dưới để thanh toán số tiền gia hạn.</p>
                <div className="bg-white p-4 inline-block rounded-xl border border-slate-200 shadow-sm mb-4">
                  {PAYMENT_CONFIG.qrCodeUrl ? (
                    <img src={PAYMENT_CONFIG.qrCodeUrl} alt="QR" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-400">QR Code</div>
                  )}
                </div>
                <div className="text-left bg-white p-4 rounded-xl">
                  <p className="text-sm flex justify-between mb-2"><span className="text-slate-500">Nội dung:</span> <strong>Gia han lop {idDangKy}</strong></p>
                  <p className="text-sm flex justify-between"><span className="text-slate-500">Số tiền:</span> <strong className="text-xl text-blue-600">{formatCurrency(tongTienTamTinh)}</strong></p>
                </div>
              </div>

              <Button onClick={handleThanhToan} disabled={submitting} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2">
                {submitting ? "Đang xử lý hệ thống..." : <><CreditCard size={20}/> Tôi đã thanh toán thành công</>}
              </Button>
            </div>
          )}

        </Card>
      </div>
    </main>
  );
}