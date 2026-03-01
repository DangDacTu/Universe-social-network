const Message = require("../models/Message");

let users = [];

// (Khi user đăng nhập, ta lưu userId của họ kèm với socketId của phiên kết nối)
const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

// 2. Hàm xóa user khi ngắt kết nối
const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

// 3. Hàm tìm socketId của người nhận để gửi tin
const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

const socketModule = (io) => {
    io.on("connection", (socket) => {
        // 1. Lấy userId từ query params (Frontend gửi lên)
        const userId = socket.handshake.query.userId;
        
        if (userId) {
            addUser(userId, socket.id);
            io.emit("getUsers", users);
        }

        // --- SỰ KIỆN 2: GỬI TIN NHẮN ---
        // Đổi tên sự kiện thành sendMessage (camelCase) như bạn muốn
        socket.on("sendMessage", async (data) => {
            const { receiverId, content, mediaType, mediaUrl } = data;
            const senderId = userId; // Lấy từ session socket

            try {
                // 1. LƯU VÀO DATABASE (Quan trọng để không mất tin nhắn)
                const newMessage = await Message.create({
                    senderId,
                    receiverId,
                    content,
                    mediaType: mediaType || "text",
                    mediaUrl: mediaUrl || "",
                    isRead: false
                });

                // 2. Gửi cho người nhận nếu họ đang online
                const user = getUser(receiverId);
                if (user) {
                    io.to(user.socketId).emit("getMessage", newMessage);
                }
            } catch (err) {
                console.error("Lỗi socket:", err);
            }
        });

        // --- SỰ KIỆN 3: NGẮT KẾT NỐI (Tắt tab/Trình duyệt) ---
        socket.on("disconnect", () => {
            removeUser(socket.id);
            io.emit("getUsers", users);
        });
    });
};

module.exports = socketModule;