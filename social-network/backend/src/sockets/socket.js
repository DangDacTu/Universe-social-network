/**
 * @file socket.js
 * @author moi
 * @description
 * Socket.IO chat realtime 1-1
 * - Online / Offline
 * - Seen / Delivered
 * - Text / Image / File / Voice
 */

const Message = require("../models/Message");
const User = require("../models/User");

// userId -> socketId
const onlineUsers = new Map();

// userId -> đang mở chat với ai
const activeChats = new Map();

/**
 * Kiểm tra follow 2 chiều
 */
const checkMutualFollow = async (senderId, receiverId) => {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) return false;

    return (
        sender.following.some(id => id.toString() === receiverId.toString()) &&
        receiver.following.some(id => id.toString() === senderId.toString())
    );
};

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        /* ===============================
            USER ONLINE
        =============================== */
        socket.on("user-online", (userId) => {
            socket.userId = userId;
            onlineUsers.set(userId.toString(), socket.id);

            io.emit("user-status", {
                userId,
                isOnline: true,
            });

            socket.emit("online-users", Array.from(onlineUsers.keys()));
        });

        /* ===============================
            USER OPEN CHAT (SEEN)
        =============================== */
        socket.on("open-chat", async ({ otherUserId }) => {
            if (!socket.userId) return;

            activeChats.set(socket.userId.toString(), otherUserId.toString());

            // mark messages as seen
            await Message.updateMany(
                {
                    senderId: otherUserId,
                    receiverId: socket.userId,
                    isSeen: false,
                },
                {
                    $set: { isSeen: true, isRead: true },
                }
            );

            // notify sender
            const senderSocketId = onlineUsers.get(otherUserId.toString());
            if (senderSocketId) {
                io.to(senderSocketId).emit("messages-seen", {
                    byUserId: socket.userId,
                });
            }
        });

        /* ===============================
            SEND MESSAGE
            TEXT / IMAGE / FILE / VOICE
        =============================== */
        socket.on(
            "send-message",
            async ({
                receiverId,
                content = "",
                mediaUrl = "",
                mediaType = "text",

                // OPTIONAL metadata
                mediaName = "",
                mediaMimeType = "",
                mediaSize = 0,
                audioDuration = 0,
            }) => {
                try {
                    const senderId = socket.userId;
                    if (!senderId) return;

                    // validate text
                    if (
                        mediaType === "text" &&
                        (!content || !content.trim())
                    ) {
                        return;
                    }

                    // follow 2 chiều
                    const canChat = await checkMutualFollow(
                        senderId,
                        receiverId
                    );
                    if (!canChat) {
                        socket.emit("chat-error", {
                            message:
                                "You must follow each other to send messages",
                        });
                        return;
                    }

                    const receiverOnline = onlineUsers.has(
                        receiverId.toString()
                    );

                    const receiverActiveChat =
                        activeChats.get(receiverId.toString()) ===
                        senderId.toString();

                    const message = await Message.create({
                        senderId,
                        receiverId,
                        content,

                        mediaUrl,
                        mediaType,
                        mediaName,
                        mediaMimeType,
                        mediaSize,
                        audioDuration,

                        isDelivered: receiverOnline,
                        isSeen: receiverActiveChat,
                        isRead: receiverActiveChat,
                    });

                    // gửi cho receiver
                    const receiverSocketId = onlineUsers.get(
                        receiverId.toString()
                    );
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit(
                            "receive-message",
                            message
                        );
                    }

                    // gửi lại sender
                    socket.emit("message-sent", message);
                } catch (err) {
                    console.error("Send message error:", err);
                    socket.emit("chat-error", {
                        message: "Failed to send message",
                    });
                }
            }
        );

        /* ===============================
            DISCONNECT
        =============================== */
        socket.on("disconnect", () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId.toString());
                activeChats.delete(socket.userId.toString());

                io.emit("user-status", {
                    userId: socket.userId,
                    isOnline: false,
                });
            }
            console.log("User disconnected:", socket.id);
        });
    });
};

module.exports = socketHandler;
