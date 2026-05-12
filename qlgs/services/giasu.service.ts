import { GiaSuSearchResult } from "@/types/giasu.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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
