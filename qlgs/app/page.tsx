"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Section, Text } from "@/component/ui";
import ProcessModal from "../component/ProcessModal";

const servicePoints = [
  "Tìm gia sư theo môn học, cấp lớp và ngân sách chỉ trong một lượt tìm.",
  "Quản lý lịch dạy, khóa học, học viên và tiến trình học tập trên cùng một hệ thống.",
  "Giảm thao tác thủ công cho trung tâm, phụ huynh và gia sư.",
];

const giaSuFeatures = [
  {
    title: "Hồ Sơ Cá Nhân",
    description: "Cập nhật thông tin cá nhân, số điện thoại, CCCD và bằng cấp",
    href: "/gia-su/ho-so",
  },
  {
    title: "Lịch Rảnh",
    description: "Đăng ký các khung giờ rảnh để học viên có thể đặt lớp",
    href: "/gia-su/lich-ranh",
  },
  {
    title: "Khóa Học",
    description: "Tạo và quản lý các khóa học của bạn",
    href: "/gia-su/khoa-hoc",
  },
];

const trustMetrics = [
  { value: "24h", label: "phản hồi yêu cầu ghép lớp" },
  { value: "1 nền tảng", label: "gồm tìm kiếm, booking và quản lý" },
  { value: "MADZ", label: "thương hiệu tập trung vào vận hành gọn" },
];

const footerColumns = [
  {
    title: "Dịch vụ",
    items: ["Tìm gia sư", "Quản lý khóa học", "Theo dõi lịch dạy", "Báo cáo vận hành"],
  },
  {
    title: "Đối tượng",
    items: ["Phụ huynh", "Gia sư", "Trung tâm", "Học viên"],
  },
  {
    title: "MADZ Sch.",
    items: ["Về chúng tôi", "Quy trình kết nối", "Chính sách hỗ trợ", "Liên hệ"],
  },
];

const hocVienFeatures = [
  {
    title: "Hồ Sơ Học Viên",
    description: "Thêm thông tin con em để đăng ký khóa học",
    href: "/hoc-vien/ho-so",
  },
  {
    title: "Lịch Sử Khóa Học",
    description: "Xem tất cả các khóa học đã đăng ký",
    href: "/hoc-vien/lich-su",
  },
  {
    title: "Tìm Khóa Học",
    description: "Tìm kiếm khóa học phù hợp với nhu cầu",
    href: "/search",
  },
  {
    title: "Đánh Giá & Xin Nghỉ",
    description: "Đánh giá gia sư và xin nghỉ học khi cần",
    href: "#",
  },
];

export default function Home() {
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const router = useRouter();

  const handleSearchClick = () => {
    router.push("/search");
  };

  return (
    <main className="page-shell">
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-6">
            <Text as="p" size="caption" tone="primary" className="font-semibold uppercase tracking-[0.18em]">
              Nền tảng tìm và quản lý gia sư
            </Text>
            <Text as="h1" size="hero" className="max-w-4xl">
              MADZ Sch. kết nối đúng gia sư và giữ toàn bộ vận hành dạy học trong tầm tay.
            </Text>
            <Text size="lead" tone="muted" className="max-w-3xl">
              Từ khâu tìm kiếm ban đầu đến lịch dạy, booking và theo dõi khóa học, hệ
              thống được thiết kế để trung tâm và phụ huynh ra quyết định nhanh hơn.
            </Text>
            <div className="flex flex-wrap gap-3">
              <Link href="/search">
                <Button size="lg">Tìm gia sư</Button>
              </Link>
              <Button size="lg" variant="secondary">
                Xem giải pháp
              </Button>
            </div>
          </div>

          <div className="surface-card overflow-hidden bg-[var(--color-canvas-parchment)] p-5 md:p-8">
            <div className="rounded-[var(--radius-lg)] bg-white p-5">
              <div className="mb-6 flex items-center justify-between">
                <Text as="h2" size="title">
                  Tìm kiếm thông minh
                </Text>
                <Text size="caption" tone="primary">
                  Search + filter
                </Text>
              </div>

              <div className="grid gap-4">
                <Input label="Từ khóa" placeholder="Toán, Tiếng Anh, Lớp 10..." />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Môn học" placeholder="Toán học" />
                  <Input label="Ngân sách" placeholder="Đến 500.000" />
                </div>
                <Button fullWidth onClick={handleSearchClick}>Tìm kết quả phù hợp</Button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {trustMetrics.map((metric) => (
                <Card key={metric.label} className="space-y-2 bg-white">
                  <Text size="display">{metric.value}</Text>
                  <Text size="caption" tone="muted">
                    {metric.label}
                  </Text>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ===== CHỨC NĂNG HỌC VIÊN ===== */}
      <Section id="hoc-vien-features" tone="dark">
        <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-4">
            <Text as="h2" size="display" tone="onDark">
              Chức năng quản lý cho học viên.
            </Text>
            <Text tone="onDark" className="max-w-xl opacity-90">
              Tìm kiếm, đặt lớp, quản lý lịch học và đánh giá gia sư một cách dễ dàng trên một nền tảng.
            </Text>
            <div className="flex flex-wrap gap-3">
              <Link href="/search">
                <Button>Tìm khóa học</Button>
              </Link>
              <Link href="/hoc-vien/lich-su">
                <Button variant="secondary">Lịch sử khóa học</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {hocVienFeatures.map((feature) => (
              <Link key={feature.href} href={feature.href}>
                <Card className="space-y-3 hover:shadow-lg transition cursor-pointer bg-white">
                  <Text size="title">{feature.title}</Text>
                  <Text tone="muted">{feature.description}</Text>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="parchment" id="dich-vu">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <Text as="h2" size="display">
            Quảng bá dịch vụ nhẹ nhàng, để sản phẩm lên tiếng.
          </Text>
          <Text size="lead" tone="muted" className="max-w-3xl opacity-90">
            MADZ Sch. tập trung vào hai việc: giúp người dùng tìm được gia sư phù hợp và
            giúp đơn vị vận hành ít rối hơn sau khi đã kết nối.
          </Text>
        </div>
      </Section>

      <Section tone="dark">
        <div className="grid gap-6 lg:grid-cols-3">
          {servicePoints.map((point, index) => (
            <Card key={point} className="flex min-h-64 flex-col justify-between bg-white">
              <div className="space-y-4">
                <Text size="caption" tone="primary" className="font-semibold uppercase tracking-[0.14em]">
                  0{index + 1}
                </Text>
                <Text as="h3" size="title">
                  {index === 0 && "Tìm đúng đối tượng"}
                  {index === 1 && "Quản lý xuyên suốt"}
                  {index === 2 && "Vận hành gọn"}
                </Text>
                <Text tone="muted">{point}</Text>
              </div>
              <Text size="caption" tone="primary">
                Learn more
              </Text>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="gia-su-features" tone="parchment">
        <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-4">
            <Text as="h2" size="display">
              Chức năng quản lý cho gia sư.
            </Text>
            <Text className="max-w-xl opacity-90">
              Tất cả những gì bạn cần để quản lý dạy học một cách chuyên nghiệp, hiệu quả và minh bạch.
            </Text>
            
            <div className="flex flex-wrap gap-3">
              {/* Nút từ nhánh baocao_thongke */}
              <Button onClick={() => router.push('/dashboard')}>
                Xem dashboard
              </Button>
              <Button variant="secondary" onClick={() => setIsProcessModalOpen(true)}>
                Xem quy trình
              </Button>

              {/* Nút từ nhánh develop */}
              <Link href="/gia-su/ho-so">
                <Button variant="outline">Cập nhật hồ sơ</Button>
              </Link>
              <Link href="/gia-su/khoa-hoc">
                <Button variant="outline">Tạo khóa học</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {giaSuFeatures.map((feature) => (
              <Link key={feature.href} href={feature.href}>
                <Card className="space-y-3 hover:shadow-lg transition cursor-pointer bg-white">
                  <Text size="title">{feature.title}</Text>
                  <Text tone="muted">{feature.description}</Text>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="dark">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Text as="h2" size="display" tone="onDark">
              Đặt một lớp vỏ giống brochure, nhưng vẫn sẵn sàng cho sản phẩm thật.
            </Text>
            <Text size="body" tone="onDark" className="max-w-2xl opacity-90">
              Page này được xây để quảng bá MADZ Sch., nhưng cấu trúc component và token
              bên dưới có thể tái sử dụng để mở rộng sang search page, dashboard và course
              listing.
            </Text>
          </div>

          <Card tone="dark" className="space-y-4 border-white/12 bg-[var(--color-surface-tile-2)]">
            <Text size="title" tone="onDark">
              Sẵn sàng để tiếp tục
            </Text>
            <Text size="body" tone="onDark" className="opacity-85">
              Nếu bạn muốn, bước tiếp theo nên là tách header/footer thành component riêng
              và dùng tiếp bộ UI này để làm trang search khóa học thật.
            </Text>
            <Button>Triển khai tiếp</Button>
          </Card>
        </div>
      </Section>

      {/* ===== FOOTER ===== */}
      <footer
        id="lien-he"
        className="border-t border-black/6 bg-[var(--color-canvas-parchment)] py-16 text-[var(--color-ink)]"
      >
        <div className="content-lock px-6 md:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <Text as="h2" size="display">
                MADZ Sch.
              </Text>
              <Text tone="muted" className="max-w-2xl">
                Giải pháp quảng bá, kết nối và quản lý gia sư cho trung tâm muốn vận hành
                rõ ràng hơn và cho phụ huynh muốn tìm người dạy phù hợp nhanh hơn.
              </Text>
              <div className="flex flex-wrap gap-3">
                <Button>Đăng ký tư vấn</Button>
                <Button variant="secondary">Nhận demo</Button>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {footerColumns.map((column) => (
                <div key={column.title} className="space-y-3">
                  <Text as="h3" size="caption" className="font-semibold">
                    {column.title}
                  </Text>
                  <div className="space-y-2">
                    {column.items.map((item) => (
                      <Text key={item} size="body" tone="muted">
                        {item}
                      </Text>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-black/6 pt-6 md:flex-row md:items-center md:justify-between">
            <Text size="fine">Copyright 2026 MADZ Sch. All rights reserved.</Text>
            <Text size="fine">Nền tảng quản lý và cho thuê gia sư hướng tới vận hành gọn.</Text>
          </div>
        </div>
      </footer>

      {/* Component Modal được gọi ở đây để nó có thể hiển thị lên màn hình */}
      <ProcessModal 
        isOpen={isProcessModalOpen} 
        onClose={() => setIsProcessModalOpen(false)} 
      />
    </main>
  );
}