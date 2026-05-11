// Đường dẫn: services/gia-su.service.ts

import axiosClient from './axiosClient';

// Types
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

// Mock data for dropdowns (since backend doesn't have endpoints for these)
export const mockTietHoc = [
  { idTietHoc: 'TH_T2_C1', thu: 'Thứ 2', gioBatDau: '17:30', gioKetThuc: '19:30', soTiet: 2 },
  { idTietHoc: 'TH_T2_C2', thu: 'Thứ 2', gioBatDau: '19:30', gioKetThuc: '21:30', soTiet: 2 },
  { idTietHoc: 'TH_T3_C1', thu: 'Thứ 3', gioBatDau: '17:30', gioKetThuc: '19:30', soTiet: 2 },
  { idTietHoc: 'TH_T3_C2', thu: 'Thứ 3', gioBatDau: '19:30', gioKetThuc: '21:30', soTiet: 2 },
  { idTietHoc: 'TH_T4_C1', thu: 'Thứ 4', gioBatDau: '17:30', gioKetThuc: '19:30', soTiet: 2 },
  { idTietHoc: 'TH_T4_C2', thu: 'Thứ 4', gioBatDau: '19:30', gioKetThuc: '21:30', soTiet: 2 },
  { idTietHoc: 'TH_T5_C1', thu: 'Thứ 5', gioBatDau: '17:30', gioKetThuc: '19:30', soTiet: 2 },
  { idTietHoc: 'TH_T5_C2', thu: 'Thứ 5', gioBatDau: '19:30', gioKetThuc: '21:30', soTiet: 2 },
  { idTietHoc: 'TH_T6_C1', thu: 'Thứ 6', gioBatDau: '17:30', gioKetThuc: '19:30', soTiet: 2 },
  { idTietHoc: 'TH_T6_C2', thu: 'Thứ 6', gioBatDau: '19:30', gioKetThuc: '21:30', soTiet: 2 },
  { idTietHoc: 'TH_T7_C1', thu: 'Thứ 7', gioBatDau: '08:00', gioKetThuc: '10:00', soTiet: 2 },
  { idTietHoc: 'TH_T7_C2', thu: 'Thứ 7', gioBatDau: '10:00', gioKetThuc: '12:00', soTiet: 2 },
  { idTietHoc: 'TH_T7_C3', thu: 'Thứ 7', gioBatDau: '14:00', gioKetThuc: '16:00', soTiet: 2 },
  { idTietHoc: 'TH_CN_C1', thu: 'Chủ nhật', gioBatDau: '08:00', gioKetThuc: '10:00', soTiet: 2 },
  { idTietHoc: 'TH_CN_C2', thu: 'Chủ nhật', gioBatDau: '10:00', gioKetThuc: '12:00', soTiet: 2 },
  { idTietHoc: 'TH_CN_C3', thu: 'Chủ nhật', gioBatDau: '14:00', gioKetThuc: '16:00', soTiet: 2 },
];

export const mockMonHoc = [
  { idMonHoc: 'MH001', tenMonHoc: 'Toán Học' },
  { idMonHoc: 'MH002', tenMonHoc: 'Tiếng Anh' },
  { idMonHoc: 'MH003', tenMonHoc: 'Tiếng Việt' },
  { idMonHoc: 'MH004', tenMonHoc: 'Vật Lý' },
  { idMonHoc: 'MH005', tenMonHoc: 'Hóa Học' },
  { idMonHoc: 'MH006', tenMonHoc: 'Sinh Học' },
  { idMonHoc: 'MH007', tenMonHoc: 'Lịch Sử' },
  { idMonHoc: 'MH008', tenMonHoc: 'Địa Lý' },
];

export const mockDanhMucLop = [
  { idDanhMucLop: 'L6', tenLop: 'Lớp 6', maCapHoc: 'CH001' },
  { idDanhMucLop: 'L7', tenLop: 'Lớp 7', maCapHoc: 'CH001' },
  { idDanhMucLop: 'L8', tenLop: 'Lớp 8', maCapHoc: 'CH001' },
  { idDanhMucLop: 'L9', tenLop: 'Lớp 9', maCapHoc: 'CH001' },
  { idDanhMucLop: 'L10', tenLop: 'Lớp 10', maCapHoc: 'CH002' },
  { idDanhMucLop: 'L11', tenLop: 'Lớp 11', maCapHoc: 'CH002' },
  { idDanhMucLop: 'L12', tenLop: 'Lớp 12', maCapHoc: 'CH002' },
];

export const giaSuService = {
  // 1. Tạo hồ sơ gia sư
  createProfile: (data: GiaSuProfile): Promise<string> => {
    return axiosClient.post('/gia-su/tao-moi', data);
  },

  // 2. Thêm bằng cấp
  addBangCap: (data: BangCap): Promise<string> => {
    return axiosClient.post('/gia-su/them-bang-cap', data);
  },

  // 3. Xóa bằng cấp
  deleteBangCap: (idBangCap: string): Promise<string> => {
    return axiosClient.delete(`/gia-su/bang-cap/${idBangCap}`);
  },

  // 4. Lấy thông tin chi tiết gia sư (bao gồm bằng cấp)
  getProfileDetail: (idGiaSu: string): Promise<any> => {
    return axiosClient.get(`/gia-su/${idGiaSu}/chi-tiet`);
  },

  // 5. Cập nhật hồ sơ gia sư
  updateProfile: (idGiaSu: string, data: GiaSuProfile): Promise<string> => {
    return axiosClient.put(`/gia-su/${idGiaSu}`, data);
  },

  // 6. Đăng ký lịch rảnh
  registerLichRanh: (data: LichRanh): Promise<string> => {
    return axiosClient.post('/gia-su/dang-ky-lich-ranh', data);
  },

  // 7. Tạo khóa học
  createKhoaHoc: (data: KhoaHoc): Promise<string> => {
    return axiosClient.post('/khoa-hoc/tao-moi', data);
  },

  // 8. Đổi mật khẩu
  changePassword: (data: {
    matKhauCu: string;
    matKhauMoi: string;
    xacNhanMatKhau: string;
  }): Promise<string> => {
    return axiosClient.post('/tai-khoan/doi-mat-khau', data);
  },

  // 9. Get mock data for dropdowns
  getTietHoc: (): Promise<any[]> => {
    return Promise.resolve(mockTietHoc);
  },

  getMonHoc: (): Promise<any[]> => {
    return Promise.resolve(mockMonHoc);
  },

  getDanhMucLop: (): Promise<any[]> => {
    return Promise.resolve(mockDanhMucLop);
  },

  // 10. Tạo tiết học mới (động)
  createTietHoc: (data: {
    thu: string;
    gioBatDau: string;
    gioKetThuc: string;
  }): Promise<any> => {
    return axiosClient.post('/tiet-hoc/tao-moi', data);
  },

  // 11. Xóa lịch rảnh
  deleteLichRanh: (idLichDay: string): Promise<string> => {
    return axiosClient.delete(`/gia-su/lich-ranh/${idLichDay}`);
  },

  // 12. Lấy lịch rảnh của gia sư
  getLichRanh: (idGiaSu: string): Promise<any[]> => {
    return axiosClient.get(`/gia-su/${idGiaSu}/lich-ranh`);
  },

  // 13. Cập nhật tiết học
  updateTietHoc: (idTietHoc: string, data: {
    thu: string;
    gioBatDau: string;
    gioKetThuc: string;
  }): Promise<any> => {
    return axiosClient.put(`/tiet-hoc/${idTietHoc}`, data);
  },
};
