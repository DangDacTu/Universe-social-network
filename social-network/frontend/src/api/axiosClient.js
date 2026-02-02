import axios from "axios";

const axiosClient = axios.create({
    // Cấu hình linh hoạt: 
    // - Ưu tiên lấy từ biến môi trường (cho Vercel kết nối Render)
    // - Ưu tiên lấy từ biến môi trường (cho Vercel)
    // - Nếu không có thì dùng localhost
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use((config) => {
    // Lấy Token trực tiếp từ localStorage (Cách tối ưu)
    const token = localStorage.getItem("token");
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
// Interceptor để tự động gắn Token vào mỗi request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
}, (error) => {
    return Promise.reject(error);
});
export default axiosClient;