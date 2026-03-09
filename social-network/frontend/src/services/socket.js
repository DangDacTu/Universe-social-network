import { io } from "socket.io-client";

// Đổi URL này nếu bạn deploy (ví dụ: https://api.your-app.com)
const SOCKET_URL = "http://localhost:5000"; 

let socket = null;

/**
 * Khởi tạo kết nối Socket
 * @param {string} userId - ID của user đang đăng nhập
 */
export const connectSocket = (userId) => {
    // Chỉ tạo mới nếu chưa có hoặc đã mất kết nối
    if (!socket || !socket.connected) {
        socket = io(SOCKET_URL, {
            transports: ["websocket"], // Bắt buộc dùng websocket để nhanh nhất
            reconnectionAttempts: 5,   // Thử kết nối lại 5 lần nếu mất mạng
            
            // Gửi userId ngay trong lúc bắt tay
            // Backend sẽ đọc cái này ở dòng: socket.handshake.query.userId
            query: {
                userId: userId
            }
        });

        // Debug log để biết đã kết nối chưa
        socket.on("connect", () => {
            console.log(" Socket Connected:", socket.id);
        });
        
        socket.on("connect_error", (err) => {
            console.error(" Socket Error:", err.message);
        });
    }
    return socket;
};

// Hàm lấy socket instance để dùng ở các component khác
export const getSocket = () => {
    if (!socket) {
        console.warn(" Socket chưa được khởi tạo!");
    }
    return socket;
};

// Hàm ngắt kết nối (dùng khi Logout)
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log(" Socket Disconnected");
    }
};