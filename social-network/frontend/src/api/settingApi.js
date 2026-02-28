/**
 * @file settingApi.js
 * @author moi
 * @description
 * Gọi API liên quan tới setting
 */
import axios from "axios";

const API_URL = "http://localhost:5000/api/settings";

// 👉 TẠO INSTANCE RIÊNG
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// 👉 TỰ ĐỘNG GẮN TOKEN
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        console.log("accessToken:", token); // 🔍 THÊM LOG

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

const settingsApi = {
    getSettings: () =>
        axiosInstance.get("/"),

    updatePrivacy: (data) =>
        axiosInstance.put("/privacy", data),

    changePassword: (data) =>
        axiosInstance.put("/change-password", data),

    /** Cập nhật giao diện (màu/ảnh nền) - gửi lên backend và lưu vào Settings */
    updateAppearance: (data) =>
        axiosInstance.put("/", {
            background: data.background,
            backgroundType: data.type,
        }),
};

export default settingsApi;