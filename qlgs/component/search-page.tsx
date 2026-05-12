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
          // Lấy data từ response.data nếu là AxiosResponse, hoặc trực tiếp nếu là array
          const data = response.data ? response.data : response;
          setResults(Array.isArray(data) ? data : []);
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
          <Text size="caption" tone="primary">
            Search + filter đồng thời
          </Text>
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

        <div className="grid gap-4">
          {results.map((course) => (
            <Card key={course.idKhoaHoc} className="space-y-4 bg-white">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <Text as="h3" size="title">
                    {course.tenKhoaHoc}
                  </Text>
                  <Text tone="muted">
                    {course.tenMonHoc ?? "Chưa rõ môn học"} · {course.tenLop ?? "Chưa rõ lớp"} · Gia sư{" "}
                    {course.tenGiaSu ?? "đang cập nhật"}
                  </Text>
                </div>
                <div className="rounded-[var(--radius-pill)] bg-[var(--color-canvas-parchment)] px-4 py-2 text-right">
                  <Text size="bodyStrong">{formatCurrency(course.soTienHoc)}</Text>
                  <Text size="caption" tone="muted" className="block mt-1">
                    {course.soBuoiHoc ? `${course.soBuoiHoc} buổi` : ""}
                  </Text>
                </div>
              </div>

              {course.moTa && (
                <div className="border-t border-gray-200 pt-3">
                  <Text size="caption" tone="muted" className="mb-2 block">
                    Mô tả
                  </Text>
                  <Text size="body" className="line-clamp-2">
                    {course.moTa}
                  </Text>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Text size="caption" tone="primary">
                  {course.saoTrungBinh != null ? `${course.saoTrungBinh}/5 sao` : "Chưa có đánh giá"}
                </Text>
              </div>

              <div className="flex gap-3 pt-2">
                <Link href={`/hoc-vien/booking/${course.idKhoaHoc}`} className="flex-1">
                  <Button 
                    className="w-full"
                    disabled={!isLoggedIn || !isParent}
                    title={!isLoggedIn ? "Vui lòng đăng nhập" : !isParent ? "Chỉ phụ huynh mới có thể đặt lớp" : ""}
                  >
                    {!isLoggedIn ? "Đăng nhập để đặt lớp" : !isParent ? "Chỉ phụ huynh" : "Đặt lớp"}
                  </Button>
                </Link>
                <Link href={`/search/chi-tiet-khoa-hoc/${course.idKhoaHoc}`}>
                  <Button variant="secondary">Xem chi tiết</Button>
                </Link>
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

        // Lấy data từ response.data nếu là AxiosResponse, hoặc trực tiếp nếu là array
        const subjectData = subjectResponse.data ? subjectResponse.data : subjectResponse;
        const classLevelData = classLevelResponse.data ? classLevelResponse.data : classLevelResponse;
        
        setSubjects(Array.isArray(subjectData) ? subjectData : []);
        setClassLevels(Array.isArray(classLevelData) ? classLevelData : []);
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
