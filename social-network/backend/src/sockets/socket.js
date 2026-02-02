const Message = require("../models/Message");
const User = require("../models/User");

const checkMutualFollow = async (senderId, receiverId) => {
    try {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if (!sender || !receiver) return false;
        return sender.following.includes(receiverId) && receiver.following.includes(senderId);
    } catch (err) { return false; }
};

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            socket.userId = userId;
            socket.join(userId);
            io.emit("user-status", { userId, isOnline: true });
        }

        // --- GỬI TIN NHẮN ---
        socket.on("send-message", async (data) => {
            const { receiverId, content, mediaUrl, mediaType } = data;
            const senderId = socket.userId;
            if (!senderId) return;

            const canChat = await checkMutualFollow(senderId, receiverId);
            if (!canChat) {
                socket.emit("chat-error", { message: "Hai bạn phải follow nhau mới có thể nhắn tin!" });
                return;
            }

            try {
                const newMessage = await Message.create({
                    senderId, receiverId, content, mediaUrl,
                    mediaType: mediaType || "text", isRead: false
                });

                io.to(receiverId).emit("receive-message", newMessage);
                socket.emit("message-sent-success", newMessage);
            } catch (err) { console.error(err); }
        });

        // --- XÓA TIN NHẮN (MỚI) ---
        socket.on("delete-message", async ({ messageId, receiverId }) => {
            try {
                const msg = await Message.findById(messageId);
                if (!msg) return;
                // Chỉ cho phép xóa tin nhắn của chính mình
                if (msg.senderId.toString() !== socket.userId) return;

                await Message.findByIdAndDelete(messageId);

                // Báo cho cả 2 bên (người nhận và người gửi) để xóa trên giao diện
                io.to(receiverId).emit("message-deleted", { messageId });
                socket.emit("message-deleted", { messageId });
            } catch (err) { console.error(err); }
        });

        // --- SỬA TIN NHẮN (MỚI) ---
        socket.on("edit-message", async ({ messageId, receiverId, newContent }) => {
            try {
                const msg = await Message.findById(messageId);
                if (!msg) return;
                if (msg.senderId.toString() !== socket.userId) return;

                msg.content = newContent;
                await msg.save();

                const payload = { messageId, newContent };
                io.to(receiverId).emit("message-edited", payload);
                socket.emit("message-edited", payload);
            } catch (err) { console.error(err); }
        });

        socket.on("disconnect", () => {
            if (socket.userId) io.emit("user-status", { userId: socket.userId, isOnline: false });
        });
    });
};

module.exports = socketHandler;