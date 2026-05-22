// types/dashboard.ts

export interface RevenueData {
  name: string;
  doanhThu: number;
  soLop: number;
}

// types/dashboard.ts
export interface ClassStatsData {
  name: string;
  tongYeuCau: number;
  daNhanLop: number;  // Thay cho daNhan
  dangHoc: number;    // Thay cho dangXuLy
  daHoanThanh: number; // Thêm mới
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}