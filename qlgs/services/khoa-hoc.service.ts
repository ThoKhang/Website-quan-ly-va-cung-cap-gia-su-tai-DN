import axiosClient from "@/services/axiosClient";
import type {
  ClassLevelOption,
  CourseSearchResult,
  SearchFilters,
  SubjectOption,
} from "@/types/search.type";
import type { KhoaHoc, KhoaHocRequestDTO } from "@/types/khoa-hoc.type";

function normalizeNumber(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export async function searchCourses(filters: SearchFilters): Promise<CourseSearchResult[]> {
  return axiosClient.get("/khoa-hoc/tim-kiem", {
    params: {
      keyword: filters.keyword.trim() || undefined,
      idMonHoc: filters.idMonHoc || undefined,
      idDanhMucLop: filters.idDanhMucLop || undefined,
      minPrice: normalizeNumber(filters.minPrice),
      maxPrice: normalizeNumber(filters.maxPrice),
    },
  }) as Promise<CourseSearchResult[]>;
}

export async function getSubjects(): Promise<SubjectOption[]> {
  return axiosClient.get("/mon-hoc") as Promise<SubjectOption[]>;
}

export async function getClassLevels(): Promise<ClassLevelOption[]> {
  return axiosClient.get("/danh-muc-lop") as Promise<ClassLevelOption[]>;
}

// Quản lý khóa học của gia sư
export async function createCourse(data: KhoaHocRequestDTO): Promise<string> {
  return axiosClient.post("/khoa-hoc/tao-moi", data) as Promise<string>;
}

export async function getCoursesByTutor(idGiaSu: string): Promise<KhoaHoc[]> {
  return axiosClient.get("/khoa-hoc/gia-su/" + idGiaSu) as Promise<KhoaHoc[]>;
}

export async function updateCourse(idKhoaHoc: string, data: Partial<KhoaHocRequestDTO>): Promise<string> {
  return axiosClient.put("/khoa-hoc/" + idKhoaHoc, data) as Promise<string>;
}

export async function deleteCourse(idKhoaHoc: string): Promise<string> {
  return axiosClient.delete("/khoa-hoc/" + idKhoaHoc) as Promise<string>;
}

export async function getCourseDetail(idKhoaHoc: string): Promise<KhoaHoc> {
  return axiosClient.get("/khoa-hoc/" + idKhoaHoc) as Promise<KhoaHoc>;
}
