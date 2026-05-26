// Đường dẫn: services/giasu.service.ts
// Service dành cho tìm kiếm gia sư (public API, không cần authentication)
// Sử dụng cho phụ huynh tìm kiếm gia sư

import { GiaSuSearchResult } from "@/types/giasu.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * Tìm kiếm gia sư theo từ khóa hoặc môn học
 * GET /api/public/giasu/search
 * @param keyword - Từ khóa tìm kiếm (tên gia sư, ...)
 * @param idMonHoc - ID môn học
 */
export async function searchGiaSu(
  keyword?: string,
  idMonHoc?: string
): Promise<GiaSuSearchResult[]> {
  const params = new URLSearchParams();

  if (keyword?.trim()) {
    params.append("keyword", keyword.trim());
  }

  if (idMonHoc?.trim()) {
    params.append("idMonHoc", idMonHoc.trim());
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/public/giasu/search${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to search tutors: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Lấy thông tin chi tiết gia sư (public)
 * GET /api/public/giasu/{idGiaSu}
 * @param idGiaSu - ID gia sư
 */
export async function getGiaSuDetail(idGiaSu: string): Promise<GiaSuSearchResult> {
  const url = `${API_BASE_URL}/public/giasu/${idGiaSu}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get tutor detail: ${response.statusText}`);
  }

  return response.json();
}
