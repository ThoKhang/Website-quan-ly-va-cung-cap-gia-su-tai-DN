import axiosClient from "@/services/axiosClient";
import type { KhoaHocResponseDTO } from "@/types/khoa-hoc.type";

export type { KhoaHocResponseDTO };

export interface HocVienProfile {
  tenHocVien: string;
  gioiTinh: boolean;
  cccd: string;
  ngaySinh: string;
}

export interface PhuHuynhProfile {
  tenPhuHuynh: string;
  gioiTinh: boolean;
  ngaySinh: string;
  sdt: string;
  cccd: string;
  soNhaTenDuong: string;
  phuongXa?: {
    maPhuongXa: string;
    tenPhuongXa: string;
    quanHuyen?: QuanHuyenDTO;
  };
}

export interface HocVienListItem {
  idHocVien: string;
  tenHocVien: string;
  gioiTinh: boolean;
  cccd: string;
  ngaySinh: string;
}

export interface QuanHuyenDTO {
  idQuanHuyen: string;
  tenQuanHuyen: string;
}

export interface PhuongXaDTO {
  maPhuongXa: string;
  tenPhuongXa: string;
  quanHuyen: QuanHuyenDTO;
}

export interface ThoiGianHocDetail {
  idLichDay: string;
  gioBatDau: string;
  gioKetThuc: string;
}

export interface BookingRequest {
  idPhuHuynh: string;
  idHocVien: string;
  idKhoaHoc: string;
  danhSachIdLichDay: string[];
  danhSachThoiGianHoc?: ThoiGianHocDetail[];
  phuongThucThanhToan: string;
  ngayBatDauHoc: string;
}

export interface DanhGiaRequest {
  idDangKy: string;
  soSao: number;
  noiDung: string;
}

export interface XinNghiRequest {
  idLichHoc: string;
  lyDoNghi: string;
}

export interface GiaSuDetailResponse {
  idGiaSu: string;
  tenGiaSu: string;
  sdt: string;
  email: string;
  saoTrungBinh: number;
  soLuongDanhGia: number;
  soLuongKhoaHoc: number;
  danhSachBangCap: string[];
}

export interface GiaSuInfo {
  idGiaSu: string;
  tenGiaSu: string;
  sdt?: string;
  email?: string;
  saoTrungBinh?: number;
  soLuongDanhGia?: number;
  soLuongKhoaHoc?: number;
}

export interface LichRanhResponse {
  idLichDay: string;
  tinhTrang: boolean;
  giaSu: GiaSuInfo;
  tietHoc: {
    idTietHoc: string;
    thu: string;
    gioBatDau: string;
    gioKetThuc: string;
    soTiet: number;
  };
}

export interface ChiTietLichHocResponse {
  idLichHoc: string;
  ngayHoc: string;
  tinhTrang: string;
  lichDay: LichRanhResponse;
}

export interface DangKyHocResponse {
  idDangKy: string;
  khoaHoc: KhoaHocResponseDTO;
  ngayDangKy: string;
  ngayBatDauHoc: string;
  trangThaiThanhToan: boolean;
  trangThaiHoanThanh: boolean;
  chiTietLichHoc: ChiTietLichHocResponse[];
}

export const hocVienService = {
  // 1. Tạo hồ sơ học viên
  createProfile: (data: HocVienProfile): Promise<any> => {
    return axiosClient.post("/hoc-vien/tao-moi", data);
  },

  // 2. Lấy thông tin phụ huynh hiện tại
  getPhuHuynhInfo: (): Promise<PhuHuynhProfile> => {
    return axiosClient.get("/phu-huynh/thong-tin-hien-tai");
  },

  // 3. Cập nhật thông tin phụ huynh
  updatePhuHuynhInfo: (data: Partial<PhuHuynhProfile>): Promise<string> => {
    return axiosClient.put("/phu-huynh/cap-nhat", data);
  },

  // 4. Lấy danh sách học viên của phụ huynh
  getHocVienList: (): Promise<HocVienListItem[]> => {
    return axiosClient.get("/hoc-vien/danh-sach");
  },

  // 5. Lấy danh sách Quận/Huyện
  getQuanHuyenList: (): Promise<QuanHuyenDTO[]> => {
    return axiosClient.get("/dia-chi/quan-huyen");
  },

  // 6. Lấy danh sách Phường/Xã theo Quận/Huyện
  getPhuongXaList: (idQuanHuyen: string): Promise<PhuongXaDTO[]> => {
    return axiosClient.get(`/dia-chi/phuong-xa/${idQuanHuyen}`);
  },

  // 7. Đặt lớp (Booking)
 bookCourse: async (data: any): Promise<any> => {
    return axiosClient.post("/booking/dat-lop", data); 
  },

  // 8. Lấy lịch sử khóa học của học viên
  getBookingHistory: (idPhuHuynh: string): Promise<DangKyHocResponse[]> => {
    return axiosClient.get(`/dang-ky-hoc/phu-huynh/${idPhuHuynh}`);
  },

  // 9. Lấy chi tiết khóa học
  getCourseDetail: (idKhoaHoc: string): Promise<KhoaHocResponseDTO> => {
    return axiosClient.get(`/khoa-hoc/${idKhoaHoc}`);
  },

  // 10. Lấy chi tiết gia sư (bao gồm số sao đánh giá)
  getTutorDetail: (idGiaSu: string): Promise<GiaSuDetailResponse> => {
    return axiosClient.get(`/gia-su/${idGiaSu}/chi-tiet`);
  },

  // 11. Lấy lịch rảnh của gia sư
  getTutorSchedule: (idGiaSu: string): Promise<LichRanhResponse[]> => {
    return axiosClient.get(`/gia-su/${idGiaSu}/lich-ranh`);
  },

  // 12. Đánh giá khóa học
  rateCourse: (data: DanhGiaRequest): Promise<string> => {
    return axiosClient.post("/danh-gia/tao-moi", data);
  },

  // 13. Xin nghỉ học
  requestAbsence: (data: XinNghiRequest): Promise<string> => {
    return axiosClient.post("/nghi-hoc/xin-nghi", data);
  },

  // 14. Lấy chi tiết lịch học
  getScheduleDetail: (idDangKy: string): Promise<ChiTietLichHocResponse[]> => {
    return axiosClient.get(`/chi-tiet-lich-hoc/dang-ky/${idDangKy}`);
  },

  xacNhanThanhToan: async (idDangKy: string, soTien: number): Promise<void> => {
      await axiosClient.post('/thanh-toan/xac-nhan', {
        idDangKy: idDangKy,
        soTien: soTien.toString(),
        phuongThuc: 'Chuyển khoản',
        maGiaoDich: "", // Vẫn giữ chuỗi rỗng nhé
      });
    },
};
