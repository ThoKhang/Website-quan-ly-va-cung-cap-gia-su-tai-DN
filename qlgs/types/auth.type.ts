// File: types/auth.type.ts

// 1. Phản chiếu lại class LoginRequestDTO của Spring Boot
export interface LoginRequest {
  tenDangNhap: string;
  matKhau: string;
}

// 2. Phản chiếu lại class AuthResponse của Spring Boot
export interface AuthResponse {
  token: string;
  message: string;
  loaiNguoiDungID: string;
  idNguoiDung: string;
}

// 3. Phản chiếu lại class RegisterRequest của Spring Boot
export interface RegisterRequest {
  tenDangNhap: string;
  matKhau: string;
  email: string;
  loaiNguoiDungID?: string; // Dấu chấm hỏi (?) nghĩa là trường này có thể có hoặc không (Optional)
}


// 4. Phản chiếu lại class ChangePasswordRequestDTO của Spring Boot
export interface ChangePasswordRequest {
  matKhauCu: string;
  matKhauMoi: string;
  xacNhanMatKhau: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface BangCap {
  idBangCap?: string;
  tenBangCap: string;
  thongTinBangCap: string;
  ngayCap: string;
  anhMinhChung: string;
  trangThai?: boolean; 
}

export interface GiaSuProfile {
  idGiaSu?: string;
  tenGiaSu: string;
  sdt: string;
  cccd: string;
  bangCapList?: BangCap[];
}
