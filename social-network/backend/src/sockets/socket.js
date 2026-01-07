/**
 * @file socket.js
 * @author moi
 * @description
 * Cấu hình Socket.IO cho chức năng chat realtime 1-1
 * - Quản lý user online
 * - Gửi/nhận tin nhắn realtime
 * - Lưu lịch sử chat vào MongoDB
 */

const Message = require("../models/Message");

// Map lưu userId -> socketId để biết user nào đang online
const onlineUsers = new Map();

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log(" User connected:", socket.id);

        /**
         * Client gửi userId khi online
         * → lưu socketId tương ứng
         */
        socket.on("user-online", (userId) => {
            onlineUsers.set(userId, socket.id);
            socket.userId = userId;
        });

        /**
         * Xử lý gửi tin nhắn realtime
         * - Lưu tin nhắn vào DB
         * - Gửi realtime nếu người nhận đang online
         */
        socket.on("send-message", async ({ senderId, receiverId, content }) => {
            const message = await Message.create({
                senderId,
                receiverId,
                content,
            });

            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receive-message", message);
            }
        });

        /**
         * Khi user ngắt kết nối
         * → xoá khỏi danh sách online
         */
        socket.on("disconnect", () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
            }
            console.log(" User disconnected:", socket.id);
        });
    });
};

module.exports = socketHandler;
