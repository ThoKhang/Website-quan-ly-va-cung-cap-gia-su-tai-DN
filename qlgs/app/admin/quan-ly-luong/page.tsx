"use client";

import { useState, useEffect } from "react";
import { 
  Search, Banknote, QrCode, CheckCircle2, AlertTriangle, 
  Loader2, X, Wallet
} from "lucide-react";
import { dashboardService } from "@/services/dashboardService";

// Interface map với DTO từ Backend
interface GiaSuLuongAdmin {
  idGiaSu: string;
  tenGiaSu: string;
  nganHang: string;
  stk: string;
  luongHienCon: number;
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

export default function AdminQuanLyLuongPage() {
  const [giaSus, setGiaSus] = useState<GiaSuLuongAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // States cho tính năng Thanh toán (QR Modal)
  const [payModal, setPayModal] = useState<{ isOpen: boolean; giaSu: GiaSuLuongAdmin | null }>({
    isOpen: false,
    giaSu: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchGiaSuLuong();
  }, []);

  const fetchGiaSuLuong = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getDanhSachTraLuong();
      setGiaSus(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách lương:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!payModal.giaSu) return;
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // ✅ Gọi API thực
      await dashboardService.thanhToanLuong(
        payModal.giaSu.idGiaSu, 
        payModal.giaSu.luongHienCon
      );
      
      setSuccessMsg("Thanh toán thành công! Lịch sử đã được lưu.");
      
      setTimeout(() => {
        setGiaSus(prev => prev.filter(gs => gs.idGiaSu !== payModal.giaSu?.idGiaSu));
        setPayModal({ isOpen: false, giaSu: null });
        setSuccessMsg("");
      }, 1500);

    } catch (error: any) {
      setErrorMsg(error?.message || "Lỗi hệ thống khi thanh toán!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGiaSus = giaSus.filter(gs => 
    gs.tenGiaSu.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gs.idGiaSu.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 w-full max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#4A7766] flex items-center gap-2">
            <Wallet size={24} /> Quản lý lương Gia sư
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi và thanh toán lương hiện còn cho các gia sư trên hệ thống.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm mã hoặc tên gia sư..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4A7766] focus:border-[#4A7766] sm:text-sm transition-all"
          />
        </div>
      </div>

      {/* ── BẢNG DỮ LIỆU ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#4A7766]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Mã GS</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tên Gia Sư</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Thông Tin Ngân Hàng</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Lương Cần Trả</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 size={32} className="animate-spin text-[#4A7766] mx-auto mb-3" /><p className="text-slate-500 text-sm">Đang tải dữ liệu...</p></td></tr>
            ) : filteredGiaSus.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center"><Banknote size={32} className="text-slate-300 mx-auto mb-3" /><p className="text-slate-500 text-sm">Không có gia sư nào cần thanh toán lương.</p></td></tr>
            ) : (
              filteredGiaSus.map((item) => (
                <tr key={item.idGiaSu} className="hover:bg-[#ECE7E2]/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{item.idGiaSu}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#4A7766]">{item.tenGiaSu}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-800">{item.nganHang}</div>
                    <div className="text-xs text-slate-500">STK: {item.stk}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-emerald-600">
                    {fmtCurrency(item.luongHienCon)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => setPayModal({ isOpen: true, giaSu: item })}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A7766] hover:bg-[#385c4f] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <QrCode size={16} /> Thanh toán
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── MODAL THANH TOÁN (QR CODE) ── */}
      {payModal.isOpen && payModal.giaSu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900">Thanh toán lương</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mã GS: {payModal.giaSu.idGiaSu}</p>
              </div>
              <button onClick={() => !isSubmitting && setPayModal({ isOpen: false, giaSu: null })} className="p-2 bg-white rounded-full hover:bg-slate-200 transition-colors">
                <X size={18} className="text-slate-500"/>
              </button>
            </div>

            {/* Nội dung Modal */}
            <div className="p-6 space-y-4">
              {errorMsg && <div className="p-3 rounded-xl text-sm flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200"><AlertTriangle size={16}/>{errorMsg}</div>}
              {successMsg && <div className="p-3 rounded-xl text-sm flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 size={16}/>{successMsg}</div>}

              {!successMsg && (
                <>
                  <div className="flex justify-center">
                    <div className="bg-white border-2 border-slate-100 rounded-2xl p-3 shadow-sm">
                      {/* Tích hợp API VietQR tạo mã QR tự động */}
                      <img 
                        src={`https://img.vietqr.io/image/${payModal.giaSu.nganHang}-${payModal.giaSu.stk}-compact2.png?amount=${payModal.giaSu.luongHienCon}&addInfo=Thanh toan luong ${payModal.giaSu.idGiaSu}&accountName=${payModal.giaSu.tenGiaSu}`} 
                        alt="QR Code" 
                        className="w-56 h-56 rounded-xl object-contain"
                      />
                    </div>
                  </div>

                  <div className="bg-[#ECE7E2]/50 rounded-xl p-4 space-y-2 border border-[#ECE7E2] text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Người nhận</span><span className="font-bold text-slate-800">{payModal.giaSu.tenGiaSu}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Ngân hàng</span><span className="font-medium text-slate-800">{payModal.giaSu.nganHang} - {payModal.giaSu.stk}</span></div>
                    <div className="flex justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-slate-500">Số tiền cần chuyển</span>
                      <span className="font-bold text-lg text-[#4A7766]">{fmtCurrency(payModal.giaSu.luongHienCon)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleConfirmPayment} 
                    disabled={isSubmitting}
                    className="w-full py-3 mt-2 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all shadow-sm bg-[#4A7766] hover:bg-[#385c4f] disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle2 size={18}/>}
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận đã chuyển khoản"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}