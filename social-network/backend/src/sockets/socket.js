/**
 * @file socket.js
 * @description Xử lý logic Socket.IO (Room-based Architecture)
 */

const Message = require("../models/Message");
const User = require("../models/User");

// Map: userId -> otherUserId (Để check xem user có đang mở khung chat với người kia không)
const activeChats = new Map();

/**
 * Helper: Kiểm tra follow 2 chiều
 */
const checkMutualFollow = async (senderId, receiverId) => {
    try {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if (!sender || !receiver) return false;

        return (
            sender.following.some(id => id.toString() === receiverId.toString()) &&
            receiver.following.some(id => id.toString() === senderId.toString())
        );
    } catch (e) {
        console.error(e);
        return false;
    }
};

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        // 1. LẤY USER ID TỪ QUERY PARAM (Gửi từ Client lúc connect)
        const userId = socket.handshake.query.userId;

        if (userId) {
            socket.userId = userId;
            // 🔥 QUAN TRỌNG: Join vào room mang tên userId của chính mình
            socket.join(userId);
            console.log(`User ${userId} connected & joined room: ${userId}`);

            // Báo cho mọi người biết mình Online
            io.emit("user-status", { userId, isOnline: true });
            
            // Gửi danh sách Online hiện tại (dựa trên các room đang có)
            // Lưu ý: Logic lấy ds online này đơn giản, thực tế nên dùng Redis
            const onlineUserIds = Array.from(io.sockets.adapter.rooms.keys()).filter(id => id.length > 10); // Lọc ID user (giả sử ID dài)
            io.emit("online-users", onlineUserIds);
        }

        /* ===============================
            SEND MESSAGE
        =============================== */
        socket.on("send-message", async (data) => {
            const { 
                receiverId, content, mediaUrl, mediaType, 
                mediaName, mediaMimeType, mediaSize, audioDuration 
            } = data;

            const senderId = socket.userId;
            if (!senderId) return;

            try {
                // 1. Kiểm tra Follow
                const canChat = await checkMutualFollow(senderId, receiverId);
                if (!canChat) {
                    socket.emit("chat-error", { message: "You must follow each other to chat" });
                    return;
                }

                // 2. Kiểm tra Receiver có đang mở chat với mình không (để set isSeen)
                // Check trong Map activeChats
                // Lưu ý: activeChats lưu "UserA" -> "UserB" (A đang xem B)
                const isReceiverWatching = activeChats.get(receiverId) === senderId;

                // 3. Kiểm tra Receiver có Online không (Check room tồn tại)
                const isReceiverOnline = io.sockets.adapter.rooms.has(receiverId);

                // 4. Tạo tin nhắn
                const newMessage = await Message.create({
                    senderId,
                    receiverId,
                    content,
                    mediaUrl,
                    mediaType,
                    mediaName,
                    mediaMimeType,
                    mediaSize,
                    audioDuration,
                    isDelivered: isReceiverOnline,
                    isSeen: isReceiverWatching,
                    isRead: isReceiverWatching
                });

                // 5. 🔥 GỬI REALTIME (Gửi thẳng vào Room của người nhận)
                io.to(receiverId).emit("receive-message", newMessage);

                // 6. Gửi lại cho người gửi (để confirm đã lưu DB)
                socket.emit("message-sent-success", newMessage);

            } catch (err) {
                console.error("Socket Send Error:", err);
            }
        });

        /* ===============================
            OPEN CHAT (Đã Xem)
        =============================== */
        socket.on("open-chat", async ({ otherUserId }) => {
            if (!socket.userId) return;
            
            // Lưu trạng thái: User hiện tại đang chat với otherUser
            activeChats.set(socket.userId, otherUserId);

            // Update DB: Đánh dấu tất cả tin nhắn từ người kia là đã xem
            await Message.updateMany(
                { senderId: otherUserId, receiverId: socket.userId, isSeen: false },
                { $set: { isSeen: true, isRead: true } }
            );

            // Gửi sự kiện cho người kia biết: "Tôi đã đọc tin của bạn"
            io.to(otherUserId).emit("messages-seen", { byUserId: socket.userId });
        });

        /* ===============================
            TYPING (Tuỳ chọn)
        =============================== */
        socket.on("typing", ({ receiverId }) => {
            io.to(receiverId).emit("user-typing", { userId: socket.userId });
        });

        socket.on("stop-typing", ({ receiverId }) => {
            io.to(receiverId).emit("user-stop-typing", { userId: socket.userId });
        });

        /* ===============================
            DISCONNECT
        =============================== */
        socket.on("disconnect", () => {
            if (socket.userId) {
                activeChats.delete(socket.userId);
                io.emit("user-status", { userId: socket.userId, isOnline: false });
                console.log(`User ${socket.userId} disconnected`);
            }
        });
    });
};

module.exports = socketHandler;