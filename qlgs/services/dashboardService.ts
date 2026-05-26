import axiosClient from './axiosClient';
import { RevenueData, ClassStatsData } from '../types/dashboard';
export interface BinhLuanAdminDTO {
  idDanhGia: string;
  idDangKy: string;
  tenPhuHuynh: string;
  tenKhoaHoc: string;
  tenGiaSu: string;
  soSao: number;
  noiDung: string;
  ngayDanhGia: string;
}
export interface GiaSuLuongAdmin {
  idGiaSu: string;
  tenGiaSu: string;
  nganHang: string;
  stk: string;
  luongHienCon: number;
}
export const dashboardService = {
  getRevenueStats: async (): Promise<RevenueData[]> => {
    try {
      // ✅ Bỏ .data vì axiosClient interceptor đã unwrap rồi
      return await axiosClient.get(`/thong-ke/doanh-thu-bieu-do`) as unknown as RevenueData[];
    } catch (error) {
      return [];
    }
  },

  getClassStats: async (): Promise<ClassStatsData[]> => {
    try {
      return await axiosClient.get(`/dashboard/class-stats`) as unknown as ClassStatsData[];
    } catch (error) {
      return [];
    }
  },
  getAllDanhGia: async (): Promise<BinhLuanAdminDTO[]> => {
    try {
      return await axiosClient.get(`/danh-gia/admin/tat-ca`) as unknown as BinhLuanAdminDTO[];
    } catch (error) {
      console.error("Lỗi fetch đánh giá admin:", error);
      return [];
    }
  },

  // Xóa đánh giá
  deleteDanhGia: async (idDanhGia: string): Promise<any> => {
    // Không bọc try-catch ở đây để catch bên file UI (page.tsx) xử lý hiển thị thông báo lỗi
    return await axiosClient.delete(`/danh-gia/admin/${idDanhGia}`);
  },
  getDanhSachTraLuong: async (): Promise<GiaSuLuongAdmin[]> => {
    try {
      return await axiosClient.get(`/admin/luong-gia-su`) as unknown as GiaSuLuongAdmin[];
    } catch (error) {
      return [];
    }
  },

  // Gửi xác nhận thanh toán
  thanhToanLuong: async (idGiaSu: string, soTien: number): Promise<any> => {
    return await axiosClient.post(`/admin/luong-gia-su/thanh-toan`, {
      idGiaSu,
      soTien
    });
  }
};