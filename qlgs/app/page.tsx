import { Button, Card, Input, Section, Text } from "@/component/ui";

const servicePoints = [
  "Tìm gia sư theo môn học, cấp lớp và ngân sách chỉ trong một lượt tìm.",
  "Quản lý lịch dạy, khóa học, học viên và tiến trình học tập trên cùng một hệ thống.",
  "Giảm thao tác thủ công cho trung tâm, phụ huynh và gia sư.",
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

export default function Home() {
  return (
    <main className="page-shell">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(0,0,0,0.88)] text-white backdrop-blur-xl">
        <div className="content-lock flex items-center justify-between px-6 py-3 md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold">
              M
            </div>
            <Text as="span" size="bodyStrong" tone="onDark">
              MADZ Sch.
            </Text>
          </div>

          <nav className="hidden items-center gap-7 md:flex">
            <Text as="a" href="#dich-vu" size="caption" tone="onDark" className="opacity-80 hover:opacity-100">
              Dịch vụ
            </Text>
            <Text as="a" href="#quan-ly" size="caption" tone="onDark" className="opacity-80 hover:opacity-100">
              Quản lý
            </Text>
            <Text as="a" href="#lien-he" size="caption" tone="onDark" className="opacity-80 hover:opacity-100">
              Liên hệ
            </Text>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden md:inline-flex">
              Tư vấn
            </Button>
            <Button>Bắt đầu</Button>
          </div>
        </div>
      </header>

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
              <Button size="lg">Tìm gia sư</Button>
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
                <Button fullWidth>Tìm kết quả phù hợp</Button>
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

      <Section tone="dark" id="dich-vu">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <Text as="h2" size="display" tone="onDark">
            Quảng bá dịch vụ nhẹ nhàng, để sản phẩm lên tiếng.
          </Text>
          <Text size="lead" tone="onDark" className="max-w-3xl opacity-90">
            MADZ Sch. tập trung vào hai việc: giúp người dùng tìm được gia sư phù hợp và
            giúp đơn vị vận hành ít rối hơn sau khi đã kết nối.
          </Text>
        </div>
      </Section>

      <Section tone="parchment">
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

      <Section id="quan-ly">
        <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-4">
            <Text as="h2" size="display">
              Một bộ máy quản lý gói gọn cho trung tâm gia sư.
            </Text>
            <Text tone="muted" className="max-w-xl">
              Theo dõi khóa học đang mở, học viên đã đăng ký, lịch dạy của gia sư và
              doanh thu phát sinh mà không cần tách nhỏ quy trình ra nhiều công cụ.
            </Text>
            <div className="flex flex-wrap gap-3">
              <Button>Xem dashboard</Button>
              <Button variant="secondary">Xem quy trình</Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="space-y-3">
              <Text size="title">Khóa học và booking</Text>
              <Text tone="muted">
                Tạo khóa học, nhận booking và đổi trạng thái xử lý trong cùng một luồng
                công việc.
              </Text>
            </Card>
            <Card className="space-y-3">
              <Text size="title">Lịch dạy và học viên</Text>
              <Text tone="muted">
                Gom lịch dạy, tiết học và thông tin học viên để đội ngũ dễ phối hợp.
              </Text>
            </Card>
            <Card className="space-y-3">
              <Text size="title">Search giữ filter</Text>
              <Text tone="muted">
                Người dùng có thể tìm lại nhanh mà vẫn giữ bộ lọc cũ, đúng nghiệp vụ
                backend hiện tại.
              </Text>
            </Card>
            <Card className="space-y-3">
              <Text size="title">Báo cáo thực dụng</Text>
              <Text tone="muted">
                Dễ mở rộng sau này với thống kê doanh thu, gia sư và hiệu suất vận hành.
              </Text>
            </Card>
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
    </main>
  );
}
