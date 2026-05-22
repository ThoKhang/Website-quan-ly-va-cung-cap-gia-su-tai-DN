// services/dashboardService.ts
import axiosClient from './axiosClient'; 
import { RevenueData, ClassStatsData } from '../types/dashboard';

export const dashboardService = {
  getRevenueStats: async (): Promise<RevenueData[]> => {
    try {
      const response = await axiosClient.get(`/thong-ke/doanh-thu-bieu-do`);
      return response as unknown as RevenueData[]; // interceptor đã unwrap rồi
    } catch (error) {
      return [];
    }
  },

  getClassStats: async (): Promise<ClassStatsData[]> => {
    try {
      const response = await axiosClient.get(`/dashboard/class-stats`);
      return response as unknown as ClassStatsData[]; // bỏ .data
    } catch (error) {
      return [];
    }
  }
};