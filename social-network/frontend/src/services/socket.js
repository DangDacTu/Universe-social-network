/**
 * @file socket.js
 * @author moi
 * @description
 * Quản lý kết nối socket.io phía client
 * - Kết nối tới server
 * - Gửi userId khi online
 */

import { io } from "socket.io-client";

// URL backend socket
const SOCKET_URL = "http://localhost:5000";

// Biến socket dùng chung
let socket = null;

/**
 * Kết nối socket với server
 * @param {string} userId - id user hiện tại
 */
export const connectSocket = (userId) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ["websocket"],
        });

        // ✅ CHỜ SOCKET CONNECT XONG
        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);

            // 🔥 Gửi userId cho server
            socket.emit("user-online", userId);
        });

        // (tuỳ chọn) debug lỗi
        socket.on("connect_error", (err) => {
            console.error("Socket connect error:", err.message);
        });
    }

    return socket;
};

/**
 * Lấy instance socket hiện tại
 */
export const getSocket = () => socket;
