export interface KhoaHoc {
  idKhoaHoc: string;
  tenKhoaHoc: string;
  moTa: string;
  yeuCau?: string;
  noiDungKhoaHoc?: string;
  soTienHoc: number;
  soBuoiHoc: number;
  tenMonHoc: string;
  tenLop: string;
  tenGiaSu: string;
  idGiaSu?: string;
  saoTrungBinh?: number;
  trangThai?: number; // 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối
  ngayTao?: string;
}

export interface KhoaHocRequestDTO {
  tenKhoaHoc: string;
  moTa: string;
  yeuCau?: string;
  noiDungKhoaHoc?: string;
  soTienHoc: number;
  soBuoiHoc: number;
  idGiaSu: string;
  idMonHoc: string;
  idDanhMucLop: string;
  danhSachIdTietHocRanh: string[];
}

export interface KhoaHocResponseDTO {
  idKhoaHoc: string;
  tenKhoaHoc: string;
  soTienHoc: number;
  soBuoiHoc: number;
  tenMonHoc: string;
  tenLop: string;
  tenGiaSu: string;
  idGiaSu: string;
  saoTrungBinh?: number;
}
