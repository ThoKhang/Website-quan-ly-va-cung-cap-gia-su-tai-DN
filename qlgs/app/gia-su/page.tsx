// Đường dẫn: app/gia-su/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Section, Text } from "@/component/ui";

const features = [
  {
    title: "Hồ Sơ Cá Nhân",
    description: "Cập nhật thông tin cá nhân, số điện thoại và CCCD",
    href: "/gia-su/ho-so",
    icon: "👤",
  },
  {
    title: "Bằng Cấp",
    description: "Thêm bằng cấp và chứng chỉ của bạn",
    href: "/gia-su/bang-cap",
    icon: "📜",
  },
  {
    title: "Lịch Rảnh",
    description: "Đăng ký các khung giờ rảnh để học viên có thể đặt lớp",
    href: "/gia-su/lich-ranh",
    icon: "📅",
  },
  {
    title: "Khóa Học",
    description: "Tạo và quản lý các khóa học của bạn",
    href: "/gia-su/khoa-hoc",
    icon: "🎓",
  },
];

const stats = [
  { value: "0", label: "Lớp đang dạy" },
  { value: "4.5", label: "Đánh giá trung bình" },
  { value: "0 đ", label: "Tổng thu nhập" },
  { value: "0", label: "Học viên" },
];

export default function GiaSuDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const roleId = localStorage.getItem('loaiNguoiDungID');
    
    if (!token || roleId !== '2') {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      setUserName('Gia sư');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loaiNguoiDungID');
    localStorage.removeItem('idNguoiDung');
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="page-shell">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(0,0,0,0.88)] text-white backdrop-blur-xl">
        <div className="content-lock flex items-center justify-between px-6 py-3 md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold">
              GS
            </div>
            <Text as="span" size="bodyStrong" tone="onDark">
              Dashboard Gia Sư
            </Text>
          </div>

          <div className="flex items-center gap-3">
            <Text as="span" size="caption" tone="onDark" className="opacity-80">
              Xin chào, {userName}!
            </Text>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-sm font-medium"
            >
              Đăng Xuất
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Section>
        <div className="flex flex-col gap-6">
          <div>
            <Text as="p" size="caption" tone="primary" className="font-semibold uppercase tracking-[0.18em]">
              Quản lý dạy học
            </Text>
            <Text as="h1" size="hero" className="max-w-4xl">
              Quản lý khóa học, lịch dạy và học viên trong một nền tảng.
            </Text>
            <Text size="lead" tone="muted" className="max-w-3xl mt-4">
              Từ khâu tạo khóa học, đăng ký lịch rảnh đến theo dõi học viên và doanh thu, hệ thống được thiết kế để bạn quản lý hiệu quả hơn.
            </Text>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="space-y-2 bg-white">
                <Text size="display">{stat.value}</Text>
                <Text size="caption" tone="muted">
                  {stat.label}
                </Text>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section tone="parchment">
        <div className="space-y-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
            <Text as="h2" size="display">
              Các chức năng chính
            </Text>
            <Text size="lead" tone="muted" className="max-w-3xl">
              Tất cả những gì bạn cần để quản lý dạy học một cách chuyên nghiệp và hiệu quả.
            </Text>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Link key={feature.href} href={feature.href}>
                <Card className="flex min-h-64 flex-col justify-between bg-white hover:shadow-lg transition cursor-pointer">
                  <div className="space-y-4">
                    <Text size="display" className="text-3xl">
                      {feature.icon}
                    </Text>
                    <Text as="h3" size="title">
                      {feature.title}
                    </Text>
                    <Text tone="muted">{feature.description}</Text>
                  </div>
                  <Text size="caption" tone="primary" className="font-semibold">
                    Truy cập →
                  </Text>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section tone="dark">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <Text as="h2" size="display" tone="onDark">
            Sẵn sàng bắt đầu?
          </Text>
          <Text size="lead" tone="onDark" className="max-w-3xl opacity-90">
            Hãy cập nhật hồ sơ của bạn, đăng ký lịch rảnh và tạo khóa học đầu tiên ngay hôm nay.
          </Text>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/gia-su/ho-so">
              <Button size="lg">Cập nhật hồ sơ</Button>
            </Link>
            <Link href="/gia-su/khoa-hoc">
              <Button size="lg" variant="secondary">
                Tạo khóa học
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
