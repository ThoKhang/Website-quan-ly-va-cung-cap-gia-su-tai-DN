import { SearchPage } from "@/component/search-page";
import type { SearchFilters } from "@/types/search.type";

type SearchRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function SearchRoute({ searchParams }: SearchRouteProps) {
  const params = await searchParams;
  const initialFilters: SearchFilters = {
    keyword: getFirstValue(params.keyword),
    idMonHoc: getFirstValue(params.idMonHoc),
    idDanhMucLop: getFirstValue(params.idDanhMucLop),
    minPrice: getFirstValue(params.minPrice),
    maxPrice: getFirstValue(params.maxPrice),
  };

  const queryKey = new URLSearchParams(
    Object.entries(initialFilters).filter(([, value]) => value.trim() !== ""),
  ).toString();

  return <SearchPage initialFilters={initialFilters} queryKey={queryKey} />;
}
