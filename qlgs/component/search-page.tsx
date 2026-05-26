"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getClassLevels, getSubjects, searchCourses } from "@/services/khoa-hoc.service";
import { useAuthStore } from "@/store/auth.store";
import type {
  ClassLevelOption,
  CourseSearchResult,
  SearchFilters,
  SubjectOption,
} from "@/types/search.type";
import {
  Search, Filter, BookOpen, Star, Home, ChevronRight,
  Clock, MapPin, X, Loader2
} from "lucide-react";

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
    if (normalizedValue) params.set(key, normalizedValue);
  }
  return params.toString();
}

function formatCurrency(value?: number) {
  if (value == null || Number.isNaN(value)) return "Liên hệ báo giá";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
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
  const { isLoggedIn } = useAuthStore();
  
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const debouncedFilters = useDebouncedValue(filters, 300);
  const [results, setResults] = useState<CourseSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (isMounted) setResults(Array.isArray(response) ? response : []);
      } catch {
        if (isMounted) {
          setError("Không thể tải kết quả tìm kiếm.");
          setResults([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadResults();
    return () => { isMounted = false; };
  }, [debouncedFilters, pathname, queryKey, router]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((value) => value.trim() !== "").length;
  }, [filters]);

  function updateFilter<Key extends keyof SearchFilters>(key: Key, value: SearchFilters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      
      {/* ══════════════════════════════════
          HERO BANNER & BREADCRUMBS (Đã thu gọn)
      ══════════════════════════════════ */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 w-full pt-5 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <nav className="flex items-center text-sm font-medium text-blue-200/70 mb-4">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5"><Home size={14} /> Trang chủ</Link>
            <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            <span className="text-white font-bold">Khám phá khóa học</span>
          </nav>
          
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">Tìm kiếm khóa học & Gia sư</h1>
          <p className="text-blue-200 text-sm font-medium max-w-xl">Hàng ngàn gia sư chất lượng cao đang sẵn sàng đồng hành cùng bạn trên con đường học tập.</p>
        </div>
      </div>

      {/* ══════════════════════════════════
          MAIN CONTENT AREA (Đã bỏ overlap, thêm padding top)
      ══════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-20">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr] items-start">
          
          {/* SIDEBAR: BỘ LỌC TÌM KIẾM */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 p-6 lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Filter size={18} className="text-blue-600" /> Bộ lọc tìm kiếm
              </h2>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 px-2 py-1 rounded-md transition-colors">
                  Xóa lọc ({activeFilterCount})
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Từ khóa */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Từ khóa</label>
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tên môn, gia sư..."
                    value={filters.keyword}
                    onChange={(e) => updateFilter("keyword", e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Môn học */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Môn học</label>
                <select
                  value={filters.idMonHoc}
                  onChange={(e) => updateFilter("idMonHoc", e.target.value)}
                  disabled={isMetadataLoading}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium appearance-none cursor-pointer disabled:opacity-60"
                >
                  <option value="">-- Tất cả môn học --</option>
                  {subjects.map((s) => (
                    <option key={s.idMonHoc} value={s.idMonHoc}>{s.tenMonHoc}</option>
                  ))}
                </select>
              </div>

              {/* Lớp học */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Cấp lớp</label>
                <select
                  value={filters.idDanhMucLop}
                  onChange={(e) => updateFilter("idDanhMucLop", e.target.value)}
                  disabled={isMetadataLoading}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium appearance-none cursor-pointer disabled:opacity-60"
                >
                  <option value="">-- Tất cả cấp lớp --</option>
                  {classLevels.map((c) => (
                    <option key={c.idDanhMucLop} value={c.idDanhMucLop}>{c.tenLop}</option>
                  ))}
                </select>
              </div>

              {/* Mức giá */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Khoảng giá (VNĐ)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Từ..."
                    value={filters.minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value.replace(/[^\d]/g, ""))}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-center"
                  />
                  <span className="text-slate-300">-</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Đến..."
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value.replace(/[^\d]/g, ""))}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* KẾT QUẢ TÌM KIẾM */}
          <div className="space-y-6">
            
            {/* Header Kết quả */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-black text-slate-800">
                {isLoading ? "Đang tìm kiếm..." : `Tìm thấy ${results.length} khóa học`}
              </h2>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
                <X size={20} /> <span className="font-bold">{error}</span>
              </div>
            )}

            {!isLoading && results.length === 0 && !error && (
              <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-lg font-black text-slate-800 mb-2">Không có kết quả phù hợp</h3>
                <p className="text-slate-500 text-sm">Thử thay đổi từ khóa, nới rộng khoảng giá hoặc chọn môn học khác nhé.</p>
                <button onClick={clearFilters} className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors">
                  Xóa bộ lọc hiện tại
                </button>
              </div>
            )}

            {isLoading && results.length === 0 && (
              <div className="flex justify-center py-20">
                <Loader2 size={40} className="animate-spin text-blue-500" />
              </div>
            )}

            {/* Grid Kết quả */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((course) => (
                <div key={course.idKhoaHoc} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all flex flex-col h-full relative">
                  
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={course.anhMinhHoa || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop"}
                      alt={course.tenKhoaHoc}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="rounded-lg bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-blue-700 uppercase tracking-wider shadow-sm">
                        {course.tenMonHoc || "Môn học"}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 rounded-xl bg-blue-600 px-3 py-1.5 shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="text-sm font-black text-white">
                        {formatCurrency(course.soTienHoc).split(' ')[0]}K
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md">
                        <Star size={10} className="fill-amber-500 text-amber-500" />
                        <span className="text-[11px] font-bold text-amber-700">
                          {course.saoTrungBinh
                            ? course.saoTrungBinh.toFixed(1)
                            : "5.0"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {course.soBuoiHoc || 0} BUỔI
                      </span>
                    </div>

                    <h3 className="mb-4 line-clamp-2 min-h-[44px] text-[15px] font-bold leading-snug text-slate-800 group-hover:text-blue-600 transition-colors">
                      {course.tenKhoaHoc}
                    </h3>

                    <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center overflow-hidden border border-white shadow-sm flex-shrink-0 text-blue-700 font-black text-xs">
                        {course.tenGiaSu?.charAt(0) || "G"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate">{course.tenGiaSu || "Gia sư"}</span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><MapPin size={10}/> Đà Nẵng</span>
                      </div>
                    </div>

                    {/* Lớp phủ Actions */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
                      <Link href={`/search/chi-tiet-khoa-hoc/${course.idKhoaHoc}`} className="flex-1">
                        <button className="w-full py-2.5 text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all">
                          Chi tiết
                        </button>
                      </Link>
                      <Link
                        href={
                          !isLoggedIn
                            ? `/login?redirectTo=/hoc-vien/booking/${course.idKhoaHoc}`
                            : `/hoc-vien/booking/${course.idKhoaHoc}`
                        }
                        className="flex-1"
                      >
                        <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all">
                          Đăng ký
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isLoading && results.length > 0 && (
              <div className="p-4 text-center text-sm font-bold text-slate-400 bg-white rounded-2xl border border-slate-100 flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Đang cập nhật kết quả mới...
              </div>
            )}

          </div>
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
        if (!isMounted) return;
        setSubjects(Array.isArray(subjectResponse) ? subjectResponse : []);
        setClassLevels(Array.isArray(classLevelResponse) ? classLevelResponse : []);
      } catch {
        if (isMounted) setMetadataError("Không tải được dữ liệu bộ lọc môn học/lớp học.");
      } finally {
        if (isMounted) setIsMetadataLoading(false);
      }
    }
    loadMetadata();
    return () => { isMounted = false; };
  }, []);

  return (
    <>
      {metadataError && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium flex items-center gap-2">
             <X size={16}/> {metadataError}
          </div>
        </div>
      )}
      <SearchExperience
        key={queryKey}
        initialFilters={initialFilters}
        queryKey={queryKey}
        subjects={subjects}
        classLevels={classLevels}
        isMetadataLoading={isMetadataLoading}
      />
    </>
  );
}