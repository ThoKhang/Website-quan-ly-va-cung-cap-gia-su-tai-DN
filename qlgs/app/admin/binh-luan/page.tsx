"use client";

import { useState, useEffect } from "react";
import { 
  Search, Trash2, Star, AlertTriangle, 
  Loader2, MessageSquare, X 
} from "lucide-react";
import { dashboardService } from "@/services/dashboardService";

// Interface tạm thời dựa trên cấu trúc DanhGia của bạn
interface BinhLuanAdmin {
  idDanhGia: string;
  idDangKy: string;
  tenPhuHuynh: string;
  tenKhoaHoc: string;
  tenGiaSu: string;
  soSao: number;
  noiDung: string;
  ngayDanhGia: string;
}

export default function AdminBinhLuanPage() {
  const [comments, setComments] = useState<BinhLuanAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // States cho tính năng Xóa
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

    const fetchComments = async () => {
        setLoading(true);
        try {
        // Gọi API thực tế
        const data = await dashboardService.getAllDanhGia();
        setComments(data);
        } catch (error) {
        console.error("Lỗi lấy danh sách bình luận:", error);
        } finally {
        setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;
        
        setIsDeleting(true);
        try {
        // GỌI API XÓA THỰC TẾ
        await dashboardService.deleteDanhGia(deleteModal.id);
        
        // Cập nhật lại UI sau khi xóa thành công
        setComments(prev => prev.filter(c => c.idDanhGia !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null });
        } catch (error) {
        console.error("Lỗi khi xóa bình luận:", error);
        alert("Không thể xóa bình luận lúc này!");
        } finally {
        setIsDeleting(false);
        }
    };

  // Lọc dữ liệu theo Search
  const filteredComments = comments.filter(c => 
    c.noiDung.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tenPhuHuynh.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tenGiaSu.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 w-full max-w-7xl mx-auto min-h-screen bg-slate-50/50">
      
      {/* ── HEADER BẢNG ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#4A7766] flex items-center gap-2">
            <MessageSquare size={24} /> Quản lý bình luận
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kiểm duyệt và quản lý đánh giá của phụ huynh về khóa học.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên, nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4A7766] focus:border-[#4A7766] sm:text-sm transition-all"
          />
        </div>
      </div>

      {/* ── BẢNG DỮ LIỆU ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-[#4A7766]">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Mã ĐG
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Người Đánh Giá / Khóa Học
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Đánh Giá
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-1/3">
                  Nội Dung Bình Luận
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Ngày Gửi
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 size={32} className="animate-spin text-[#4A7766] mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : filteredComments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <MessageSquare size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Không tìm thấy bình luận nào.</p>
                  </td>
                </tr>
              ) : (
                filteredComments.map((item) => (
                  <tr key={item.idDanhGia} className="hover:bg-[#ECE7E2]/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      #{item.idDanhGia}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#4A7766]">{item.tenPhuHuynh}</div>
                      <div className="text-xs text-slate-500 mt-1">Khóa: {item.tenKhoaHoc}</div>
                      <div className="text-xs text-slate-400">GS: {item.tenGiaSu}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={i < item.soSao ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} 
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-slate-500 block mt-1">
                        ({item.soSao} sao)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 line-clamp-3">
                        {item.noiDung}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(item.ngayDanhGia).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: item.idDanhGia })}
                        className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition-colors"
                        title="Xóa bình luận"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL XÁC NHẬN XÓA ── */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4 text-rose-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Xóa bình luận này?</h3>
              <p className="text-sm text-slate-500">
                Hành động này không thể hoàn tác. Bình luận của phụ huynh sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}