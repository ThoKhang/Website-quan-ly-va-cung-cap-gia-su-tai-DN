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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'auth-storage',
    }
  )
);
