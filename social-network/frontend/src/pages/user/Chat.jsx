/**
 * @file Chat.jsx
 * @author moi
 * @description
 * Trang chat 1-1 (Instagram style)
 */

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { connectSocket, getSocket } from "../../services/socket";
import { getChatHistory } from "../../api/messageApi";
import userApi from "../../api/userApi";

import ChatSidebar from "../../components/ChatSidebar";
import ChatBox from "../../components/ChatBox";

export default function Chat() {
    const { user } = useAuth();

    const [chatUsers, setChatUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState({});
    const [messageInput, setMessageInput] = useState("");
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [lastMessageMap, setLastMessageMap] = useState({});

    const [unreadMap, setUnreadMap] = useState(() => {
        return JSON.parse(localStorage.getItem("unreadMap")) || {};
    });

    /* ===============================
        LOAD USERS
    =============================== */
    useEffect(() => {
        const fetchUsers = async () => {
            const res = await userApi.getChatAvailableUsers();
            setChatUsers(res.data);
        };
        fetchUsers();
    }, []);

    /* ===============================
        RESTORE SELECTED USER
    =============================== */
    useEffect(() => {
        if (chatUsers.length === 0) return;
        const saved = localStorage.getItem("selectedChatUser");
        setSelectedUser(saved ? JSON.parse(saved) : chatUsers[0]);
    }, [chatUsers]);

    /* ===============================
        SOCKET
    =============================== */
    useEffect(() => {
        if (!user) return;

        const socket = connectSocket(user._id);

        // RECEIVE MESSAGE (TEXT + MEDIA)
        socket.on("receive-message", (msg) => {
            if (msg.senderId === user._id) return; // Skip adding own messages to prevent duplication

            const otherUserId =
                msg.senderId === user._id ? msg.receiverId : msg.senderId;

            setMessages((prev) => {
                const existing = prev[otherUserId] || [];
                // Check for duplicate message based on createdAt and content
                if (existing.some(m => m.createdAt === msg.createdAt && m.content === msg.content)) {
                    return prev; // Message already exists, skip adding
                }

                const updated = {
                    ...prev,
                    [otherUserId]: [...existing, msg],
                };

                localStorage.setItem(
                    `chat_messages_${otherUserId}`,
                    JSON.stringify(updated[otherUserId])
                );

                return updated;
            });

            setLastMessageMap((prev) => ({
                ...prev,
                [otherUserId]: msg.createdAt,
            }));

            // unread count
            if (
                msg.senderId !== user._id &&
                selectedUser?._id !== otherUserId
            ) {
                setUnreadMap((prev) => {
                    const updated = {
                        ...prev,
                        [otherUserId]: (prev[otherUserId] || 0) + 1,
                    };
                    localStorage.setItem(
                        "unreadMap",
                        JSON.stringify(updated)
                    );
                    return updated;
                });
            }
        });

        // SEEN
        socket.on("messages-seen", ({ byUserId }) => {
            setMessages((prev) => {
                const updated = { ...prev };
                if (updated[byUserId]) {
                    updated[byUserId] = updated[byUserId].map((m) =>
                        m.senderId === user._id
                            ? { ...m, isSeen: true, isRead: true }
                            : m
                    );
                }
                return updated;
            });
        });

        // ONLINE STATUS
        socket.on("user-status", ({ userId, isOnline }) => {
            setOnlineUsers((prev) =>
                isOnline
                    ? [...new Set([...prev, userId])]
                    : prev.filter((id) => id !== userId)
            );
        });

        socket.on("online-users", (users) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.off("receive-message");
            socket.off("messages-seen");
            socket.off("user-status");
            socket.off("online-users");
        };
    }, [user, selectedUser]);

    /* ===============================
        LOAD CHAT HISTORY
    =============================== */
    useEffect(() => {
        if (!selectedUser) return;

        localStorage.setItem("selectedChatUser", JSON.stringify(selectedUser));

        const fetchHistory = async () => {
            const history = await getChatHistory(selectedUser._id);

            setMessages((prev) => ({
                ...prev,
                [selectedUser._id]: history,
            }));

            localStorage.setItem(
                `chat_messages_${selectedUser._id}`,
                JSON.stringify(history)
            );

            if (history.length > 0) {
                setLastMessageMap((prev) => ({
                    ...prev,
                    [selectedUser._id]:
                        history[history.length - 1].createdAt,
                }));
            }
        };

        fetchHistory();
    }, [selectedUser]);

    /* ===============================
        SEND MESSAGE (TEXT + MEDIA)
    =============================== */
    const sendMessage = (message = null, isMedia = false) => {
        const socket = getSocket();

        // ===== MEDIA =====
        if (isMedia && message && selectedUser) {
            socket.emit("send-message", message);

            setMessages((prev) => {
                const updated = {
                    ...prev,
                    [selectedUser._id]: [
                        ...(prev[selectedUser._id] || []),
                        message,
                    ],
                };

                localStorage.setItem(
                    `chat_messages_${selectedUser._id}`,
                    JSON.stringify(updated[selectedUser._id])
                );

                return updated;
            });

            setLastMessageMap((prev) => ({
                ...prev,
                [selectedUser._id]: message.createdAt,
            }));

            return;
        }

        // ===== TEXT =====
        if (!messageInput.trim() || !selectedUser) return;

        const msg = {
            senderId: user._id,
            receiverId: selectedUser._id,
            content: messageInput,
            mediaType: "text",
            createdAt: new Date().toISOString(),
        };

        socket.emit("send-message", msg);

        setMessages((prev) => {
            const updated = {
                ...prev,
                [selectedUser._id]: [...(prev[selectedUser._id] || []), msg],
            };

            localStorage.setItem(
                `chat_messages_${selectedUser._id}`,
                JSON.stringify(updated[selectedUser._id])
            );

            return updated;
        });

        setLastMessageMap((prev) => ({
            ...prev,
            [selectedUser._id]: msg.createdAt,
        }));

        setMessageInput("");
    };

    /* ===============================
        SELECT USER
    =============================== */
    const handleSelectUser = (u) => {
        setSelectedUser(u);
        localStorage.setItem("selectedChatUser", JSON.stringify(u));

        const socket = getSocket();
        socket.emit("open-chat", { otherUserId: u._id });

        setUnreadMap((prev) => {
            const updated = { ...prev, [u._id]: 0 };
            localStorage.setItem("unreadMap", JSON.stringify(updated));
            return updated;
        });

        const cached = localStorage.getItem(`chat_messages_${u._id}`);
        if (cached) {
            setMessages((prev) => ({
                ...prev,
                [u._id]: JSON.parse(cached),
            }));
        }
    };

    const sortedUsers = [...chatUsers].sort((a, b) => {
        const timeA = lastMessageMap[a._id] || 0;
        const timeB = lastMessageMap[b._id] || 0;
        return new Date(timeB) - new Date(timeA);
    });

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <ChatSidebar
                users={sortedUsers}
                onlineUsers={onlineUsers}
                unreadMap={unreadMap}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
            />

            <ChatBox
                messages={
                    selectedUser ? messages[selectedUser._id] || [] : []
                }
                currentUserId={user._id}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                onSendMessage={sendMessage}
                selectedUser={selectedUser}
            />
        </div>
    );
}

