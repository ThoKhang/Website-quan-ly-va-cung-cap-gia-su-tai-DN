"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, Section, Text } from "@/component/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getSubjects } from "@/services/khoa-hoc.service";
import { searchGiaSu } from "@/services/giasu.service";
import { useAuthStore } from "@/store/auth.store";
import type { SubjectOption } from "@/types/search.type";
import type { GiaSuSearchResult } from "@/types/giasu.type";

const defaultFilters = {
  keyword: "",
  idMonHoc: "",
};

function buildQueryString(filters: typeof defaultFilters) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    const normalizedValue = value.trim();
    if (normalizedValue) {
      params.set(key, normalizedValue);
    }
  }

  return params.toString();
}

type GiaSuSearchPageProps = {
  initialFilters: typeof defaultFilters;
  queryKey: string;
};

type GiaSuSearchExperienceProps = GiaSuSearchPageProps & {
  subjects: SubjectOption[];
  isMetadataLoading: boolean;
};

function GiaSuSearchExperience({
  initialFilters,
  queryKey,
  subjects,
  isMetadataLoading,
}: GiaSuSearchExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, loaiNguoiDungID } = useAuthStore();
  const [filters, setFilters] = useState(initialFilters);
  const debouncedFilters = useDebouncedValue(filters, 300);
  const [results, setResults] = useState<GiaSuSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isParent = loaiNguoiDungID === "1"; // 1 = Phụ huynh

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
        const response = await searchGiaSu(debouncedFilters.keyword, debouncedFilters.idMonHoc);

        if (isMounted) {
          setResults(response);
        }
      } catch {
        if (isMounted) {
          setError("Không thể tải kết quả tìm kiếm gia sư.");
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

  function updateFilter<Key extends keyof typeof filters>(key: Key, value: (typeof filters)[Key]) {
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
            Tìm gia sư
          </Text>
          <Text tone="muted">
            Nhập từ khóa hoặc chọn môn học để tìm gia sư phù hợp.
          </Text>
        </div>

        <Input
          label="Từ khóa"
          placeholder="Tên gia sư, môn học..."
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
              Danh sách gia sư
            </Text>
            <Text tone="muted">
              {isLoading ? "Đang cập nhật danh sách..." : `${results.length} gia sư phù hợp.`}
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
            <Text size="title">Chưa có gia sư phù hợp</Text>
            <Text tone="muted">
              Thử đổi từ khóa hoặc chọn môn học khác để mở rộng kết quả.
            </Text>
          </Card>
        ) : null}

        <div className="grid gap-4">
          {results.map((giaSu) => (
            <Card key={giaSu.idGiaSu} className="space-y-4 bg-white">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <Text as="h3" size="title">
                    {giaSu.tenGiaSu}
                  </Text>
                  <Text tone="muted">
                    {giaSu.soLuongKhoaHoc} khóa học · {giaSu.soLuongDanhGia} đánh giá
                  </Text>
                  {giaSu.bangCap && (
                    <Text size="caption" tone="muted">
                      Bằng cấp: {giaSu.bangCap.tenBangCap}
                    </Text>
                  )}
                </div>
                <div className="rounded-[var(--radius-pill)] bg-[var(--color-canvas-parchment)] px-4 py-2 text-right">
                  <Text size="bodyStrong">
                    {giaSu.soSaoTrungBinh > 0 ? `${giaSu.soSaoTrungBinh}/5 ⭐` : "Chưa có đánh giá"}
                  </Text>
                </div>
              </div>

              <div className="space-y-2">
                <Text size="caption" tone="muted">
                  Mã gia sư: {giaSu.idGiaSu}
                </Text>
                {giaSu.sdt && (
                  <Text size="caption" tone="muted">
                    Điện thoại: {giaSu.sdt}
                  </Text>
                )}
              </div>

              {giaSu.khoaHocs && giaSu.khoaHocs.length > 0 && (
                <div className="space-y-2">
                  <Text size="caption" tone="muted">
                    Khóa học nổi bật:
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {giaSu.khoaHocs.slice(0, 3).map((khoaHoc) => (
                      <span
                        key={khoaHoc.idKhoaHoc}
                        className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700"
                      >
                        {khoaHoc.tenKhoaHoc}
                      </span>
                    ))}
                    {giaSu.khoaHocs.length > 3 && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                        +{giaSu.khoaHocs.length - 3} khóa khác
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Link href={`/hoc-vien/chi-tiet-gia-su/${giaSu.idGiaSu}`} className="flex-1">
                  <Button className="w-full">Xem chi tiết</Button>
                </Link>
                <Link href={`/hoc-vien/booking/${giaSu.idGiaSu}`}>
                  <Button
                    variant="secondary"
                    disabled={!isLoggedIn || !isParent}
                    title={!isLoggedIn ? "Vui lòng đăng nhập" : !isParent ? "Chỉ phụ huynh mới có thể đặt lớp" : ""}
                  >
                    {!isLoggedIn ? "Đăng nhập" : !isParent ? "Chỉ phụ huynh" : "Đặt lớp"}
                  </Button>
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

export function GiaSuSearchPage({ initialFilters, queryKey }: GiaSuSearchPageProps) {
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMetadata() {
      try {
        setIsMetadataLoading(true);
        setMetadataError(null);
        const subjectResponse = await getSubjects();

        if (!isMounted) {
          return;
        }

        setSubjects(subjectResponse);
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

        <GiaSuSearchExperience
          key={queryKey}
          initialFilters={initialFilters}
          queryKey={queryKey}
          subjects={subjects}
          isMetadataLoading={isMetadataLoading}
        />
      </Section>
    </main>
  );
}
