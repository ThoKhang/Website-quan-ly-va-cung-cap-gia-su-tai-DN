// types/dashboard.ts

export interface RevenueData {
  name: string;
  doanhThu: number;
}

export interface ClassStatsData {
  name: string;
  daNhan: number;
  dangXuLy: number;
  daHuy: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}