export interface BangCapInfo {
  idBangCap: string;
  tenBangCap: string;
  thongTinBangCap: string;
  ngayCap: string;
  trangThai: boolean;
  anhMinhChung: string;
}

export interface TietHocInfo {
  idTietHoc: string;
  thu: string;
  gioBatDau: string;
  gioKetThuc: string;
  soTiet: number;
}

export interface LichRanhInfo {
  idLichDay: string;
  tinhTrang: boolean;
  tietHoc: TietHocInfo;
}

export interface KhoaHocInfo {
  idKhoaHoc: string;
  tenKhoaHoc: string;
  moTa: string;
  yeuCau: string;
  soTienHoc: number;
  soBuoiHoc: number;
  tenMonHoc: string;
  tenLop: string;
  soSaoTrungBinh: number;
  soLuongDanhGia: number;
}

export interface GiaSuSearchResult {
  idGiaSu: string;
  tenGiaSu: string;
  sdt: string;
  anhDaiDien: string;
  heSoLuong: number;
  soSaoTrungBinh: number;
  soLuongDanhGia: number;
  soLuongKhoaHoc: number;
  khoaHocs: KhoaHocInfo[];
  bangCap: BangCapInfo;
  lichRanh?: LichRanhInfo[];
}
