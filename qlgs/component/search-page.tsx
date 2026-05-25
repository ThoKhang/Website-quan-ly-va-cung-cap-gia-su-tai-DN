"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, Section, Text } from "@/component/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getClassLevels, getSubjects, searchCourses } from "@/services/khoa-hoc.service";
import { useAuthStore } from "@/store/auth.store";
import type {
  ClassLevelOption,
  CourseSearchResult,
  SearchFilters,
  SubjectOption,
} from "@/types/search.type";

const defaultFilters: SearchFilters = {
  keyword: "",
  idMonHoc: "",
  idDanhMucLop: "",
  minPrice: "",
  maxPrice: "",
};

function buildQueryString(filters: SearchFilters) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    const normalizedValue = value.trim();
    if (normalizedValue) {
      params.set(key, normalizedValue);
    }
  }

  return params.toString();
}

function formatCurrency(value?: number) {
  if (value == null || Number.isNaN(value)) {
    return "Liên hệ để nhận báo giá";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

type SearchPageProps = {
  initialFilters: SearchFilters;
  queryKey: string;
};

type SearchExperienceProps = SearchPageProps & {
  classLevels: ClassLevelOption[];
  isMetadataLoading: boolean;
  subjects: SubjectOption[];
};

function SearchExperience({
  initialFilters,
  queryKey,
  classLevels,
  isMetadataLoading,
  subjects,
}: SearchExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, loaiNguoiDungID } = useAuthStore();
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const debouncedFilters = useDebouncedValue(filters, 300);
  const [results, setResults] = useState<CourseSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isParent = loaiNguoiDungID === '1'; // 1 = Phụ huynh

  useEffect(() => {
    const nextQuery = buildQueryString(debouncedFilters);

    if (nextQuery !== queryKey) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }

    let isMounted = true;

    async function loadResults() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await searchCourses(debouncedFilters);

        if (isMounted) {
          setResults(Array.isArray(response) ? response : []);
        }
      } catch {
        if (isMounted) {
          setError("Không thể tải kết quả tìm kiếm.");
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      isMounted = false;
    };
  }, [debouncedFilters, pathname, queryKey, router]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((value) => value.trim() !== "").length;
  }, [filters]);

  function updateFilter<Key extends keyof SearchFilters>(key: Key, value: SearchFilters[Key]) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <Card className="h-fit space-y-5 bg-white/88 p-5 backdrop-blur">
        <div className="space-y-2">
          <Text as="h1" size="title">
            Tìm khóa học
          </Text>
          <Text tone="muted">
            Nhập từ khóa hoặc chỉnh bộ lọc. Sau 300ms không đổi, hệ thống sẽ gọi lại API.
          </Text>
        </div>

        <Input
          label="Từ khóa"
          placeholder="Toán, lớp 10, gia sư Anh văn..."
          value={filters.keyword}
          onChange={(event) => updateFilter("keyword", event.target.value)}
        />

        <label className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold leading-[1.42] tracking-[-0.01em] text-[var(--color-ink)]">
            Môn học
          </span>
          <select
            value={filters.idMonHoc}
            onChange={(event) => updateFilter("idMonHoc", event.target.value)}
            disabled={isMetadataLoading}
            className="h-11 rounded-[var(--radius-pill)] border border-black/8 bg-white px-5 text-[17px] leading-[1.47] tracking-[-0.02em] text-[var(--color-ink)] focus:border-[var(--color-primary-focus)] focus:outline-none disabled:opacity-60"
          >
            <option value="">Tất cả môn học</option>
            {subjects.map((subject) => (
              <option key={subject.idMonHoc} value={subject.idMonHoc}>
                {subject.tenMonHoc}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold leading-[1.42] tracking-[-0.01em] text-[var(--color-ink)]">
            Lớp học
          </span>
          <select
            value={filters.idDanhMucLop}
            onChange={(event) => updateFilter("idDanhMucLop", event.target.value)}
            disabled={isMetadataLoading}
            className="h-11 rounded-[var(--radius-pill)] border border-black/8 bg-white px-5 text-[17px] leading-[1.47] tracking-[-0.02em] text-[var(--color-ink)] focus:border-[var(--color-primary-focus)] focus:outline-none disabled:opacity-60"
          >
            <option value="">Tất cả lớp học</option>
            {classLevels.map((classLevel) => (
              <option key={classLevel.idDanhMucLop} value={classLevel.idDanhMucLop}>
                {classLevel.tenLop}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Input
            label="Giá từ"
            inputMode="numeric"
            placeholder="200000"
            value={filters.minPrice}
            onChange={(event) => updateFilter("minPrice", event.target.value.replace(/[^\d]/g, ""))}
          />
          <Input
            label="Đến"
            inputMode="numeric"
            placeholder="800000"
            value={filters.maxPrice}
            onChange={(event) => updateFilter("maxPrice", event.target.value.replace(/[^\d]/g, ""))}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Text size="caption" tone="muted">
            {activeFilterCount} trường đang áp dụng
          </Text>
          <Button variant="ghost" onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      </Card>

      <div className="space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Text as="h2" size="display">
              Kết quả tìm kiếm
            </Text>
            <Text tone="muted">
              {isLoading ? "Đang cập nhật danh sách..." : `${results.length} khóa học phù hợp.`}
            </Text>
          </div>
        </div>

        {error ? (
          <Card className="border-red-200 bg-red-50">
            <Text>{error}</Text>
          </Card>
        ) : null}

        {!isLoading && results.length === 0 && !error ? (
          <Card className="space-y-3 bg-white">
            <Text size="title">Chưa có kết quả phù hợp</Text>
            <Text tone="muted">
              Thử đổi từ khóa, nới giá tiền hoặc chọn môn học khác để mở rộng kết quả.
            </Text>
          </Card>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {results.map((course) => (
            <Card key={course.idKhoaHoc} className="flex flex-col overflow-hidden bg-white transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  src={course.anhMinhHoa || "/placeholder-course.jpg"}
                  alt={course.tenKhoaHoc}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop";
                  }}
                />
                <div className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-sm">
                  <Text size="bodyStrong" className="text-blue-600">
                    {formatCurrency(course.soTienHoc)}
                  </Text>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[12px] font-bold text-blue-600 uppercase tracking-wider">
                    {course.tenMonHoc || "Môn học"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 text-sm">★</span>
                    <Text size="caption" className="font-semibold">
                      {course.saoTrungBinh != null && course.saoTrungBinh > 0
                        ? course.saoTrungBinh.toFixed(1)
                        : "New"}
                    </Text>
                  </div>
                </div>

                <Text as="h3" size="title" className="mb-2 line-clamp-1">
                  {course.tenKhoaHoc}
                </Text>

                <div className="mb-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <span className="text-[12px] font-bold text-gray-500">
                      {course.tenGiaSu?.charAt(0) || "G"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <Text size="caption" tone="muted">Gia sư</Text>
                    <Text size="caption" className="font-medium">{course.tenGiaSu || "Đang cập nhật"}</Text>
                  </div>
                </div>

                {course.moTa && (
                  <Text size="caption" tone="muted" className="mb-5 line-clamp-2 italic">
                    {course.moTa}
                  </Text>
                )}

                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <Link href={`/hoc-vien/booking/${course.idKhoaHoc}`} className="w-full">
                    <Button
                      className="w-full h-10 text-sm"
                      disabled={!isLoggedIn || !isParent}
                    >
                      Đặt ngay
                    </Button>
                  </Link>
                  <Link href={`/search/chi-tiet-khoa-hoc/${course.idKhoaHoc}`}>
                    <Button variant="secondary" className="w-full h-10 text-sm">
                      Chi tiết
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}

          {isLoading ? (
            <Card className="bg-white">
              <Text tone="muted">Đang tải kết quả mới...</Text>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function SearchPage({ initialFilters, queryKey }: SearchPageProps) {
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevelOption[]>([]);
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMetadata() {
      try {
        setIsMetadataLoading(true);
        setMetadataError(null);
        const [subjectResponse, classLevelResponse] = await Promise.all([
          getSubjects(),
          getClassLevels(),
        ]);

        if (!isMounted) {
          return;
        }

        setSubjects(Array.isArray(subjectResponse) ? subjectResponse : []);
        setClassLevels(Array.isArray(classLevelResponse) ? classLevelResponse : []);
      } catch {
        if (isMounted) {
          setMetadataError("Không tải được dữ liệu bộ lọc.");
        }
      } finally {
        if (isMounted) {
          setIsMetadataLoading(false);
        }
      }
    }

    loadMetadata();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="page-shell">
      <Section>
        {metadataError ? (
          <Card className="mb-6 border-red-200 bg-red-50">
            <Text>{metadataError}</Text>
          </Card>
        ) : null}

        <SearchExperience
          key={queryKey}
          initialFilters={initialFilters}
          queryKey={queryKey}
          subjects={subjects}
          classLevels={classLevels}
          isMetadataLoading={isMetadataLoading}
        />
      </Section>
    </main>
  );
}
