import axiosClient from './axiosClient';
import { RevenueData, ClassStatsData } from '../types/dashboard';

export const dashboardService = {
  getRevenueStats: async (): Promise<RevenueData[]> => {
    try {
      // ✅ Bỏ .data vì axiosClient interceptor đã unwrap rồi
      return await axiosClient.get(`/thong-ke/doanh-thu-bieu-do`) as unknown as RevenueData[];
    } catch (error) {
      return [];
    }
  },

  getClassStats: async (): Promise<ClassStatsData[]> => {
    try {
      return await axiosClient.get(`/dashboard/class-stats`) as unknown as ClassStatsData[];
    } catch (error) {
      return [];
    }
  }
};