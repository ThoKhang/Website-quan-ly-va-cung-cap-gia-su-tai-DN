export type CourseSearchResult = {
  idKhoaHoc: string;
  tenKhoaHoc: string;
  tenMonHoc?: string;
  tenLop?: string;
  soTienHoc?: number;
  soBuoiHoc?: number;
  tenGiaSu?: string;
  saoTrungBinh?: number;
  moTa?: string;
};

export type SubjectOption = {
  idMonHoc: string;
  tenMonHoc: string;
};

export type ClassLevelOption = {
  idDanhMucLop: string;
  tenLop: string;
};

export type SearchFilters = {
  keyword: string;
  idMonHoc: string;
  idDanhMucLop: string;
  minPrice: string;
  maxPrice: string;
};
