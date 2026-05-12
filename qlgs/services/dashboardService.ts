// services/dashboardService.ts
import axios from 'axios';
import { RevenueData, ClassStatsData } from '../types/dashboard';

// Đã đổi thành cổng mặc định của Spring Boot (8080)
const API_BASE_URL = 'http://localhost:8080/api'; 

export const dashboardService = {
  getRevenueStats: async (): Promise<RevenueData[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/thongke/doanhthu`);
      return response.data;
    } catch (error) {
      return []; 
    }
  },

  getClassStats: async (): Promise<ClassStatsData[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/thongke/luotnhanlop`);
      return response.data;
    } catch (error) {
      return [];
    }
  }
};