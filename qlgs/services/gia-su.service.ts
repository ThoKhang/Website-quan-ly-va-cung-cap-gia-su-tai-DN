// Đường dẫn: services/gia-su.service.ts
// Service chính cho quản lý hồ sơ gia sư, bằng cấp, lịch rảnh, khóa học

import axiosClient from './axiosClient';

// ==================== TYPES ====================

export interface GiaSuProfile {
  tenGiaSu: string;
  sdt: string;
  cccd: string;
}

export interface BangCap {
  tenBangCap: string;
  thongTinBangCap: string;
  ngayCap: string;
  anhMinhChung: string;
}

export interface LichRanh {
  danhSachIdTietHoc: string[];
}

export interface KhoaHoc {
  tenKhoaHoc: string;
  moTa: string;
  yeuCau: string;
  noiDungKhoaHoc: string;
  soTienHoc: number;
  soBuoiHoc: number;
  idGiaSu: string;
  idMonHoc: string;
  idDanhMucLop: string;
  danhSachIdTietHocRanh: string[];
}

// ==================== SERVICE ====================

export const giaSuService = {
  // ========== HỒ SƠ GIA SƯ ==========
  
  /**
   * Tạo hồ sơ gia sư mới
   * POST /api/gia-su/tao-moi
   */
  createProfile: (data: GiaSuProfile): Promise<string> => {
    return axiosClient.post('/gia-su/tao-moi', data);
  },

  /**
   * Lấy thông tin hồ sơ gia sư
   * GET /api/gia-su/{idGiaSu}
   */
  getProfile: (idGiaSu: string): Promise<GiaSuProfile> => {
    return axiosClient.get(`/gia-su/${idGiaSu}`);
  },

  /**
   * Cập nhật hồ sơ gia sư
   * PUT /api/gia-su/{idGiaSu}
   */
  updateProfile: (idGiaSu: string, data: GiaSuProfile): Promise<string> => {
    return axiosClient.put(`/gia-su/${idGiaSu}`, data);
  },

  /**
   * Lấy thông tin chi tiết gia sư (bao gồm bằng cấp, đánh giá)
   * GET /api/gia-su/{idGiaSu}/chi-tiet
   */
  getProfileDetail: (idGiaSu: string): Promise<any> => {
    return axiosClient.get(`/gia-su/${idGiaSu}/chi-tiet`);
  },

  // ========== BẰNG CẤP ==========

  /**
   * Thêm bằng cấp mới
   * POST /api/gia-su/them-bang-cap
   */
  addBangCap: (data: BangCap): Promise<string> => {
    return axiosClient.post('/gia-su/them-bang-cap', data);
  },

  /**
   * Xóa bằng cấp
   * DELETE /api/gia-su/bang-cap/{idBangCap}
   */
  deleteBangCap: (idBangCap: string): Promise<string> => {
    return axiosClient.delete(`/gia-su/bang-cap/${idBangCap}`);
  },

  // ========== LỊCH RẢNH ==========

  /**
   * Lấy lịch rảnh của gia sư
   * GET /api/gia-su/{idGiaSu}/lich-ranh
   * @param idGiaSu - ID gia sư (GS001, GS002, ...)
   */
  getLichRanh: (idGiaSu: string): Promise<any[]> => {
    return axiosClient.get(`/gia-su/${idGiaSu}/lich-ranh`);
  },

  /**
   * Đăng ký lịch rảnh
   * POST /api/gia-su/dang-ky-lich-ranh
   */
  registerLichRanh: (data: LichRanh): Promise<string> => {
    return axiosClient.post('/gia-su/dang-ky-lich-ranh', data);
  },

  /**
   * Xóa lịch rảnh
   * DELETE /api/gia-su/lich-ranh/{idLichDay}
   */
  deleteLichRanh: (idLichDay: string): Promise<string> => {
    return axiosClient.delete(`/gia-su/lich-ranh/${idLichDay}`);
  },

  // ========== KHÓA HỌC ==========

  /**
   * Tạo khóa học mới
   * POST /api/khoa-hoc/tao-moi
   */
  createKhoaHoc: (data: KhoaHoc): Promise<string> => {
    return axiosClient.post('/khoa-hoc/tao-moi', data);
  },

  // ========== TIẾT HỌC ==========

  /**
   * Tạo tiết học mới
   * POST /api/tiet-hoc/tao-moi
   */
  createTietHoc: (data: {
    thu: string;
    gioBatDau: string;
    gioKetThuc: string;
  }): Promise<any> => {
    return axiosClient.post('/tiet-hoc/tao-moi', data);
  },

  /**
   * Cập nhật tiết học
   * PUT /api/tiet-hoc/{idTietHoc}
   */
  updateTietHoc: (idTietHoc: string, data: {
    thu: string;
    gioBatDau: string;
    gioKetThuc: string;
  }): Promise<any> => {
    return axiosClient.put(`/tiet-hoc/${idTietHoc}`, data);
  },

  // ========== TÀI KHOẢN ==========

  /**
   * Đổi mật khẩu
   * POST /api/tai-khoan/doi-mat-khau
   */
  changePassword: (data: {
    matKhauCu: string;
    matKhauMoi: string;
    xacNhanMatKhau: string;
  }): Promise<string> => {
    return axiosClient.post('/tai-khoan/doi-mat-khau', data);
  },
};
