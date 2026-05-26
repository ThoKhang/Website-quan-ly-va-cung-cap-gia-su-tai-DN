import axios from 'axios';

// 1. Kiểm tra biến môi trường ngay khi khởi tạo
const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Thêm timeout 10s để không bị treo request vô thời hạn
});

// Interceptor cho Request: Gắn token tự động
axiosClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 Đang gửi request: [${config.method?.toUpperCase()}] ${config.url}`);

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log(`📝 Token từ localStorage:`, token ? `${token.substring(0, 20)}...` : "KHÔNG CÓ TOKEN");
      if (token) {

        const publicApis = [
          '/auth/login',
          '/auth/register',
          '/auth/forgot-password'
        ];

        const isPublicApi = publicApis.some(api =>
          config.url?.includes(api)
        );

        // Chỉ gắn token nếu KHÔNG phải API public
        if (!isPublicApi) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`✅ Đã gắn Authorization header`);
        } else {
          console.log(`🔓 Public API -> Không gắn token`);
        }
      }
      else {
        console.warn(`⚠️ CẢNH BÁO: Không tìm thấy token trong localStorage`);
      }
    }
    return config;
  },
  (error) => {
    console.error("❌ Lỗi tại Request Interceptor:", error);
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Bắt lỗi chi tiết từ Spring Boot
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Tách chi tiết lỗi để debug nhanh
    const { response, request } = error;

    if (response) {
      // Server có phản hồi nhưng trả về mã lỗi (4xx, 5xx)
      console.error(`❌ Lỗi từ Server [${response.status}]:`, response.data);

      if (response.status === 403 || response.status === 401) {
        if (typeof window !== 'undefined') {
          console.warn("Hết hạn phiên làm việc, đang xóa token...");
          localStorage.removeItem('token');
        }
      }

      // Trả về nội dung lỗi từ Backend để UI hiển thị (Ví dụ: "Mật khẩu không đúng")
      return Promise.reject(response.data || "Lỗi hệ thống");

    } else if (request) {
      // Request đã gửi đi nhưng không nhận được phản hồi (Lỗi mạng, Server chết)
      console.error("❌ Lỗi kết nối: Server không phản hồi. Hãy kiểm tra Spring Boot đã chạy chưa!");
      return Promise.reject("Không thể kết nối đến máy chủ.");
    } else {
      // Lỗi xảy ra khi thiết lập request
      console.error("❌ Lỗi không xác định:", error.message);
      return Promise.reject(error.message);
    }
  }
);

export default axiosClient;
