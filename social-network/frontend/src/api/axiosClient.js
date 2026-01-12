import axios from 'axios';

const axiosClient = axios.create({
    // Cấu hình linh hoạt: 
    // - Ưu tiên lấy từ biến môi trường (cho Vercel)
    // - Nếu không có thì dùng localhost
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để tự động gắn Token vào mỗi request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;