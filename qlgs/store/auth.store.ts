// File: store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  tenDangNhap: string | null;
  loaiNguoiDungID: string | null;
  idNguoiDung: string | null;
  isLoggedIn: boolean;
  
  // Actions
  setAuth: (token: string, tenDangNhap: string, loaiNguoiDungID: string, idNguoiDung: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
  isAdmin: () => boolean;
  isGiaSu: () => boolean;
  isPhuHuynh: () => boolean;
  isNhanVien: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      tenDangNhap: null,
      loaiNguoiDungID: null,
      idNguoiDung: null,
      isLoggedIn: false,

      setAuth: (token, tenDangNhap, loaiNguoiDungID, idNguoiDung) => {
        set({
          token,
          tenDangNhap,
          loaiNguoiDungID,
          idNguoiDung,
          isLoggedIn: true,
        });
      },

      logout: () => {
        // Xóa tất cả dữ liệu từ localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('tenDangNhap');
        localStorage.removeItem('loaiNguoiDungID');
        localStorage.removeItem('idNguoiDung');
        localStorage.removeItem('idGiaSu');
        localStorage.removeItem('idPhuHuynh');
        
        set({
          token: null,
          tenDangNhap: null,
          loaiNguoiDungID: null,
          idNguoiDung: null,
          isLoggedIn: false,
        });
      },

      loadFromStorage: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          const tenDangNhap = localStorage.getItem('tenDangNhap');
          const loaiNguoiDungID = localStorage.getItem('loaiNguoiDungID');
          const idNguoiDung = localStorage.getItem('idNguoiDung');

          if (token && tenDangNhap) {
            set({
              token,
              tenDangNhap,
              loaiNguoiDungID,
              idNguoiDung,
              isLoggedIn: true,
            });
          }
        }
      },

      isAdmin: () => get().loaiNguoiDungID === '4',
      isGiaSu: () => get().loaiNguoiDungID === '2',
      isPhuHuynh: () => get().loaiNguoiDungID === '1',
      isNhanVien: () => get().loaiNguoiDungID === '3',
    }),
    {
      name: 'auth-storage',
    }
  )
);
