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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((course) => (
            <Card key={course.idKhoaHoc} className="group flex flex-col overflow-hidden bg-white border-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 ring-1 ring-black/5">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <img
                  src={course.anhMinhHoa || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop"}
                  alt={course.tenKhoaHoc}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-blue-600 backdrop-blur-sm uppercase shadow-sm">
                    {course.tenMonHoc || "Môn học"}
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 rounded-lg bg-blue-600 px-2.5 py-1 shadow-lg">
                  <Text className="text-[13px] font-black text-white">
                    {formatCurrency(course.soTienHoc).split(' ')[0]}K
                  </Text>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <Text className="text-[11px] font-bold text-gray-700">
                      {course.saoTrungBinh != null && course.saoTrungBinh > 0
                        ? course.saoTrungBinh.toFixed(1)
                        : "5.0"}
                    </Text>
                  </div>
                  <Text className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">
                    {course.soBuoiHoc || 0} buổi
                  </Text>
                </div>

                <Text as="h3" className="mb-3 line-clamp-2 min-h-[40px] text-[15px] font-bold leading-tight text-gray-800 group-hover:text-blue-600 transition-colors">
                  {course.tenKhoaHoc}
                </Text>

                <div className="mt-auto flex items-center gap-2 border-t border-gray-50 pt-3">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                    <span className="text-[10px] font-black text-white">
                      {course.tenGiaSu?.charAt(0) || "G"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-[10px] font-bold text-gray-900 truncate max-w-[120px]">{course.tenGiaSu || "Gia sư"}</Text>
                    <Text className="text-[9px] text-gray-400">Gia sư Chuyên nghiệp</Text>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/search/chi-tiet-khoa-hoc/${course.idKhoaHoc}`} className="flex-1">
                    <Button variant="secondary" className="w-full h-9 text-[12px] font-bold border-none bg-gray-100 hover:bg-blue-600 hover:text-white transition-all">
                      Chi tiết
                    </Button>
                  </Link>
                  <Link href={!isLoggedIn ? `/auth/login?redirectTo=/hoc-vien/booking/${course.idKhoaHoc}` : `/hoc-vien/booking/${course.idKhoaHoc}`}>
                    <Button
                      className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
                    >
                      <span className="text-lg">⊕</span>
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
