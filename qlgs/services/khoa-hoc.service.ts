import axiosClient from "@/services/axiosClient";
import type {
  ClassLevelOption,
  CourseSearchResult,
  SearchFilters,
  SubjectOption,
} from "@/types/search.type";
import type { KhoaHoc, KhoaHocRequestDTO, KhoaHocResponseDTO } from "@/types/khoa-hoc.type";

function normalizeNumber(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export async function searchCourses(filters: SearchFilters) {
  return axiosClient.get<CourseSearchResult[]>("/khoa-hoc/tim-kiem", {
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
  return axiosClient.get<SubjectOption[]>("/mon-hoc");
}

export async function getClassLevels() {
  return axiosClient.get<ClassLevelOption[]>("/danh-muc-lop");
}

// Quản lý khóa học của gia sư
export async function createCourse(data: KhoaHocRequestDTO) {
  return axiosClient.post<string>("/khoa-hoc/tao-moi", data);
}

export async function getCoursesByTutor(idGiaSu: string) {
  return axiosClient.get<KhoaHoc[]>("/khoa-hoc/gia-su/" + idGiaSu);
}

export async function updateCourse(idKhoaHoc: string, data: Partial<KhoaHocRequestDTO>) {
  return axiosClient.put<string>("/khoa-hoc/" + idKhoaHoc, data);
}

export async function deleteCourse(idKhoaHoc: string) {
  return axiosClient.delete<string>("/khoa-hoc/" + idKhoaHoc);
}

export async function getCourseDetail(idKhoaHoc: string) {
  return axiosClient.get<KhoaHoc>("/khoa-hoc/" + idKhoaHoc);
}
