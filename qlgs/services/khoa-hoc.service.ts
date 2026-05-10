import axiosClient from "@/services/axiosClient";
import type {
  ClassLevelOption,
  CourseSearchResult,
  SearchFilters,
  SubjectOption,
} from "@/types/search.type";

function normalizeNumber(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export async function searchCourses(filters: SearchFilters) {
  return axiosClient.get<CourseSearchResult[]>("/api/khoa-hoc/tim-kiem", {
    params: {
      keyword: filters.keyword.trim() || undefined,
      idMonHoc: filters.idMonHoc || undefined,
      idDanhMucLop: filters.idDanhMucLop || undefined,
      minPrice: normalizeNumber(filters.minPrice),
      maxPrice: normalizeNumber(filters.maxPrice),
    },
  });
}

export async function getSubjects() {
  return axiosClient.get<SubjectOption[]>("/api/mon-hoc");
}

export async function getClassLevels() {
  return axiosClient.get<ClassLevelOption[]>("/api/danh-muc-lop");
}
