"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";
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

  useEffect(() => {
    setIsMounted(true);
    useAuthStore.getState().loadFromStorage();
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('tenDangNhap');
    localStorage.removeItem('loaiNguoiDungID');
    localStorage.removeItem('idNguoiDung');
    localStorage.removeItem('idGiaSu');
    localStorage.removeItem('idPhuHuynh');
    router.push('/');
  };

  const isTutor = loaiNguoiDungID === '2'; // 2 = Gia sư
  const isParent = loaiNguoiDungID === '1'; // 1 = Phụ huynh
  const isStaff = loaiNguoiDungID === '3'; // 3 = Nhân viên
  const isAdmin = loaiNguoiDungID === '4'; // 4 = Admin

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(0,0,0,0.88)] text-white backdrop-blur-xl">
      <div className="content-lock flex flex-col gap-4 px-6 py-3 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold">
              M
            </div>
            <Text as="span" size="bodyStrong" tone="onDark">
              MADZ Sch.
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

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <HeaderSearchForm key={`${pathname}:${currentKeyword}`} initialKeyword={currentKeyword} pathname={pathname} />

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden text-white hover:bg-white/8 hover:text-white md:inline-flex">
              Tư vấn
            </Button>
            {isMounted && isLoggedIn && tenDangNhap ? (
              <div className="relative flex items-center gap-3">
                {isTutor && (
                  <div className="hidden md:flex items-center gap-2">
                    <Link href="/gia-su/ho-so">
                      <Button variant="ghost" className="text-white hover:bg-white/8 hover:text-white text-sm">
                        Hồ sơ
                      </Button>
                    </Link>
                    <Link href="/gia-su/lich-ranh">
                      <Button variant="ghost" className="text-white hover:bg-white/8 hover:text-white text-sm">
                        Lịch rảnh
                      </Button>
                    </Link>
                    <Link href="/gia-su/khoa-hoc">
                      <Button variant="ghost" className="text-white hover:bg-white/8 hover:text-white text-sm">
                        Khóa học
                      </Button>
                    </Link>
                  </div>
                )}
                {isParent && (
                  <div className="hidden md:flex items-center gap-2">
                    <Link href="/hoc-vien/ho-so">
                      <Button variant="ghost" className="text-white hover:bg-white/8 hover:text-white text-sm">
                        Hồ sơ
                      </Button>
                    </Link>
                    <Link href="/hoc-vien/lich-su">
                      <Button variant="ghost" className="text-white hover:bg-white/8 hover:text-white text-sm">
                        Lịch sử
                      </Button>
                    </Link>
                  </div>
                )}
                {isStaff && (
                  <div className="hidden md:flex items-center gap-2">
                    <Link href="/nhan-vien/dashboard">
                      <Button variant="ghost" className="text-white hover:bg-white/8 hover:text-white text-sm">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/nhan-vien/quan-ly">
                      <Button variant="ghost" className="text-white hover:bg-white/8 hover:text-white text-sm">
                        Quản lý
                      </Button>
                    </Link>
                  </div>
                )}
                {isAdmin && (
                  <div className="hidden md:flex items-center gap-2">
                    <Link href="/admin/dashboard">
                      <Button variant="ghost" className="text-white hover:bg-white/8 hover:text-white text-sm">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/admin/users">
                      <Button variant="ghost" className="text-white hover:bg-white/8 hover:text-white text-sm">
                        Người dùng
                      </Button>
                    </Link>
                    <Link href="/admin/settings">
                      <Button variant="ghost" className="text-white hover:bg-white/8 hover:text-white text-sm">
                        Cài đặt
                      </Button>
                    </Link>
                  </div>
                )}
                <Text as="span" size="caption" tone="onDark" className="font-medium">
                  {tenDangNhap}
                </Text>
                <Button onClick={handleLogout} variant="secondary">
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button>Đăng nhập</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
