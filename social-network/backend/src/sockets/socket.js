const Message = require("../models/Message");

const socketManager = {
    io: null,
    users: [],

    init(ioInstance) {
        this.io = ioInstance;

        this.io.on("connection", (socket) => {
            // 1. Lấy userId từ query params (Frontend gửi lên)
            const userId = socket.handshake.query.userId;
            
            if (userId) {
                this.addUser(userId, socket.id);
                this.io.emit("online-users", this.users.map(u => u.userId));
            }

            // --- SỰ KIỆN CHAT ---
            socket.on("send-message", async (data) => {
                const { receiverId, content, mediaType, mediaUrl } = data;
                const senderId = userId;

                try {
                    const newMessage = await Message.create({ senderId, receiverId, content, mediaType: mediaType || "text", mediaUrl: mediaUrl || "", isRead: false });
                    const user = this.getUser(receiverId);
                    if (user) {
                        this.io.to(user.socketId).emit("receive-message", newMessage);
                    }
                } catch (err) {
                    console.error("Lỗi socket (send-message):", err);
                }
            });

            // --- SỰ KIỆN NGẮT KẾT NỐI ---
            socket.on("disconnect", () => {
                this.removeUser(socket.id);
                this.io.emit("online-users", this.users.map(u => u.userId));
            });
        });
    },

    addUser(userId, socketId) {
        const existingUserIndex = this.users.findIndex(u => u.userId === userId);
        if (existingUserIndex !== -1) {
            this.users[existingUserIndex].socketId = socketId;
        } else {
            this.users.push({ userId, socketId });
        }
    },

    removeUser(socketId) {
        this.users = this.users.filter((user) => user.socketId !== socketId);
    },

    getUser(userId) {
        return this.users.find((user) => user.userId === userId);
    },
    
    getIO() {
        if (!this.io) {
            throw new Error("Socket.io not initialized!");
        }
        return this.io;
    }
};

module.exports = socketManager;