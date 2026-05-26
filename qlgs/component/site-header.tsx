"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Button, Text } from "@/component/ui";
import { useAuthStore } from "@/store/auth.store";

function getSearchTarget(keyword: string) {
  const params = new URLSearchParams();
  const trimmedKeyword = keyword.trim();

  if (trimmedKeyword) {
    params.set("keyword", trimmedKeyword);
  }

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

type HeaderSearchFormProps = {
  initialKeyword: string;
  pathname: string;
};

function HeaderSearchForm({ initialKeyword, pathname }: HeaderSearchFormProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = getSearchTarget(keyword);

    startTransition(() => {
      if (pathname === "/search") {
        router.replace(target);
        return;
      }
      router.push(target);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 items-center gap-2 md:w-[420px]">
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="Tìm khóa học, môn học, gia sư..."
        className="h-11 min-w-0 flex-1 rounded-[var(--radius-pill)] border border-white/12 bg-white/10 px-5 text-[15px] text-white placeholder:text-white/55 focus:border-white/30 focus:outline-none"
      />
      <Button
        type="submit"
        variant="secondary"
        className="border-white/12 bg-white text-[var(--color-ink)] hover:bg-white/92"
        disabled={isPending}
      >
        Tìm
      </Button>
    </form>
  );
}

export function SiteHeader() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentKeyword = searchParams.get("keyword") ?? "";
  const { isLoggedIn, tenDangNhap, logout, loaiNguoiDungID } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Dropdown dùng state + ref thay vì group-hover để tránh bị lệch
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mobile menu
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    useAuthStore.getState().loadFromStorage();
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('tenDangNhap');
    localStorage.removeItem('loaiNguoiDungID');
    localStorage.removeItem('idNguoiDung');
    localStorage.removeItem('idGiaSu');
    localStorage.removeItem('idPhuHuynh');
    setDropdownOpen(false);
    router.push('/');
  };

  const isTutor = loaiNguoiDungID === '2';
  const isParent = loaiNguoiDungID === '1';
  const isStaff = loaiNguoiDungID === '3';
  const isAdmin = loaiNguoiDungID === '4';

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(0,0,0,0.88)] text-white backdrop-blur-xl">
      <div className="content-lock flex items-center justify-between gap-4 px-6 py-3 md:px-10">

        {/* ── LOGO & NAV ── */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold">
              ĐN
            </div>
            <Text as="span" size="bodyStrong" tone="onDark">
              ĐN Tutor.
            </Text>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Text as="a" href="/#dich-vu" size="caption" tone="onDark" className="opacity-80 hover:opacity-100">
              Dịch vụ
            </Text>
            <Text as="a" href="/#quan-ly" size="caption" tone="onDark" className="opacity-80 hover:opacity-100">
              Quản lý
            </Text>
            <Text as="a" href="/#lien-he" size="caption" tone="onDark" className="opacity-80 hover:opacity-100">
              Liên hệ
            </Text>
          </nav>
        </div>

        {/* ── SEARCH & ACTIONS (desktop) ── */}
        <div className="hidden md:flex items-center gap-3 flex-1 justify-end min-w-0">
          <HeaderSearchForm key={`${pathname}:${currentKeyword}`} initialKeyword={currentKeyword} pathname={pathname} />

          <Link href={!isMounted || !isLoggedIn ? "/login" : isParent ? "/hoc-vien/lich-hoc" : "/gia-su/lich-ranh"}>
            <Button variant="ghost" className="text-white hover:bg-white/8 hover:text-white transition-colors">
              {isMounted && isTutor ? "Lịch dạy" : "Lịch học"}
            </Button>
          </Link>

          {isMounted && isLoggedIn && tenDangNhap ? (
            <div className="flex items-center gap-3">

              {/* Role nav links */}
              {isTutor && (
                <div className="flex items-center gap-1 border-r border-white/20 pr-3">
                  <Link href="/gia-su/lich-ranh">
                    <Button variant="ghost" className="text-white hover:bg-white/10 text-sm">Lịch rảnh</Button>
                  </Link>
                  <Link href="/gia-su/khoa-hoc">
                    <Button variant="ghost" className="text-white hover:bg-white/10 text-sm">Khóa học</Button>
                  </Link>
                </div>
              )}
              {isParent && (
                <div className="flex items-center gap-1 border-r border-white/20 pr-3">
                  <Link href="/hoc-vien/lich-su">
                    <Button variant="ghost" className="text-white hover:bg-white/10 text-sm">Khóa học</Button>
                  </Link>
                </div>
              )}
              {isStaff && (
                <div className="flex items-center gap-1 border-r border-white/20 pr-3">
                  <Link href="/nhan-vien/dashboard">
                    <Button variant="ghost" className="text-white hover:bg-white/10 text-sm">Dashboard</Button>
                  </Link>
                  <Link href="/nhan-vien/quan-ly">
                    <Button variant="ghost" className="text-white hover:bg-white/10 text-sm">Quản lý</Button>
                  </Link>
                </div>
              )}
              {isAdmin && (
                <div className="flex items-center gap-1 border-r border-white/20 pr-3">
                  <Link href="/admin/dashboard">
                    <Button variant="ghost" className="text-white hover:bg-white/10 text-sm">Dashboard</Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button variant="ghost" className="text-white hover:bg-white/10 text-sm">Người dùng</Button>
                  </Link>
                </div>
              )}

              {/* USER DROPDOWN — state-controlled */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 cursor-pointer rounded-xl px-2 py-1.5 transition-colors hover:bg-white/8"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-md border border-white/20">
                    {tenDangNhap.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block max-w-[120px] truncate text-sm font-semibold">
                    {tenDangNhap}
                  </span>
                  <svg
                    className={`w-4 h-4 opacity-70 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* DROPDOWN MENU - MỞ RỘNG RA 280px VÀ THÊM SVG */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[280px]">
                    <div className="bg-white rounded-2xl shadow-xl shadow-black/20 border border-slate-100 p-2 flex flex-col">

                      <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Đang đăng nhập</p>
                        <p className="text-sm font-bold text-slate-800 truncate" title={tenDangNhap}>{tenDangNhap}</p>
                      </div>

                      <Link href="/tai-khoan" onClick={() => setDropdownOpen(false)}>
                        <button className="w-full text-left px-3 py-2.5 text-[15px] font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-3">
                          <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                          Thông tin tài khoản
                        </button>
                      </Link>

                      {(isTutor || isParent) && (
                        <Link href={isTutor ? "/gia-su/ho-so" : "/hoc-vien/ho-so"} onClick={() => setDropdownOpen(false)}>
                          <button className="w-full text-left px-3 py-2.5 text-[15px] font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-3">
                            <svg className="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                            Thông tin hồ sơ
                          </button>
                        </Link>
                      )}

                      <div className="h-px bg-slate-100 my-1 mx-2" />

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2.5 text-[15px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3"
                      >
                        <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1-.9-2-2-2z"/>
                        </svg>
                        Đăng xuất
                      </button>

                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <Link href="/login">
              <Button>Đăng nhập</Button>
            </Link>
          )}
        </div>

        {/* ── MOBILE: avatar + hamburger ── */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          {isMounted && isLoggedIn && tenDangNhap ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold shadow-sm border border-white/20">
              {tenDangNhap.charAt(0).toUpperCase()}
            </div>
          ) : (
            <Link href="/login">
              <Button className="h-8 px-3 text-xs">Đăng nhập</Button>
            </Link>
          )}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-white/10"
            aria-label="Mở menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[rgba(0,0,0,0.95)] px-6 pb-5 pt-4 md:hidden">

          {/* Search */}
          <div className="mb-4">
            <HeaderSearchForm
              key={`mobile:${pathname}:${currentKeyword}`}
              initialKeyword={currentKeyword}
              pathname={pathname}
            />
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-0.5 mb-2">
            {[
              { href: "/#dich-vu", label: "Dịch vụ" },
              { href: "/#quan-ly", label: "Quản lý" },
              { href: "/#lien-he", label: "Liên hệ" },
              { href: "#", label: "Tư vấn" },
            ].map((l) => (
              <a key={l.href} href={l.href} className="rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/8 hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          {/* Role links */}
          {isMounted && isLoggedIn && (
            <div className="border-t border-white/10 pt-2 mt-1 flex flex-col gap-0.5">
              {isTutor && (
                <>
                  <Link href="/gia-su/lich-ranh"><button className="w-full text-left rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/8 hover:text-white">Lịch rảnh</button></Link>
                  <Link href="/gia-su/khoa-hoc"><button className="w-full text-left rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/8 hover:text-white">Khóa học</button></Link>
                </>
              )}
              {isParent && (
                <Link href="/hoc-vien/lich-su"><button className="w-full text-left rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/8 hover:text-white">Lịch sử</button></Link>
              )}
              {isStaff && (
                <>
                  <Link href="/nhan-vien/dashboard"><button className="w-full text-left rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/8 hover:text-white">Dashboard</button></Link>
                  <Link href="/nhan-vien/quan-ly"><button className="w-full text-left rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/8 hover:text-white">Quản lý</button></Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link href="/admin/dashboard"><button className="w-full text-left rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/8 hover:text-white">Dashboard</button></Link>
                  <Link href="/admin/users"><button className="w-full text-left rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/8 hover:text-white">Người dùng</button></Link>
                </>
              )}
            </div>
          )}

          {/* User info + logout */}
          {isMounted && isLoggedIn && tenDangNhap && (
            <div className="border-t border-white/10 mt-2 pt-3 flex flex-col gap-0.5">
              <div className="flex items-center gap-3 px-3 py-2 mb-1">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm border border-white/20 shrink-0">
                  {tenDangNhap.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-white/45">Đang đăng nhập</p>
                  <p className="text-sm font-semibold truncate">{tenDangNhap}</p>
                </div>
              </div>
              <Link href="/tai-khoan" onClick={() => setMobileOpen(false)}>
                <button className="w-full text-left rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/8 hover:text-white flex items-center gap-2.5">
                  👤 Thông tin tài khoản
                </button>
              </Link>
              {(isTutor || isParent) && (
                <Link href={isTutor ? "/gia-su/ho-so" : "/hoc-vien/ho-so"} onClick={() => setMobileOpen(false)}>
                  <button className="w-full text-left rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/8 hover:text-white flex items-center gap-2.5">
                    📝 Thông tin hồ sơ
                  </button>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left rounded-xl px-3 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2.5"
              >
                🚪 Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}