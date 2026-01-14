/**
 * @file ChatBox.jsx
 * @description
 * Hiển thị tin nhắn + input gửi (text / image / file / audio)
 */

import { useEffect, useRef, useState } from "react";
import { getSocket } from "../services/socket";
import uploadApi from "../api/uploadApi";

export default function ChatBox({
    messages = [],
    currentUserId,
    messageInput,
    setMessageInput,
    onSendMessage,
    selectedUser,
}) {
    const messagesEndRef = useRef(null);

    // ✅ chỉ dùng cho optimistic media của sender
    const [localMediaMessages, setLocalMediaMessages] = useState([]);

    /* ===============================
        AUTO SCROLL
    =============================== */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, localMediaMessages]);

    /* ===============================
        OPEN CHAT → SEEN
    =============================== */
    useEffect(() => {
        if (!selectedUser) return;
        const socket = getSocket();
        socket.emit("open-chat", {
            otherUserId: selectedUser._id,
        });
    }, [selectedUser]);

    /* ===============================
        UPLOAD IMAGE / FILE / AUDIO
        ✅ sender chỉ add LOCAL
    =============================== */
    const handleUpload = async (file) => {
        if (!file || !selectedUser) return;

        try {
            const res = await uploadApi.uploadFile(file);
            const socket = getSocket();

            let mediaType = "file";
            if (file.type.startsWith("image")) mediaType = "image";
            else if (file.type.startsWith("audio")) mediaType = "audio";

            // ✅ optimistic message cho sender
            const tempMessage = {
                _id: "temp-" + Date.now(),
                senderId: currentUserId,
                receiverId: selectedUser._id,
                content: "",
                mediaUrl: res.data.url,
                mediaType,
                mediaName: file.name,
                mediaMimeType: file.type,
                mediaSize: file.size,
                isDelivered: false,
                isSeen: false,
                createdAt: new Date().toISOString(),
            };

            // 👉 chỉ add local
            setLocalMediaMessages((prev) => [...prev, tempMessage]);

            // 👉 chỉ emit socket
            socket.emit("send-message", {
                receiverId: selectedUser._id,
                content: "",
                mediaUrl: res.data.url,
                mediaType,
                mediaName: file.name,
                mediaMimeType: file.type,
                mediaSize: file.size,
            });
        } catch (err) {
            console.error("Upload error:", err);
        }
    };

    if (!selectedUser) {
        return <div style={styles.empty}>Chọn một người để bắt đầu chat</div>;
    }

    /* ===============================
        MESSAGE STATUS
    =============================== */
    const lastMyMessage = [...messages]
        .reverse()
        .find((m) => m.senderId === currentUserId);

    const renderStatus = (msg) => {
        if (msg !== lastMyMessage) return null;
        if (msg.isSeen || msg.isRead) return "✓✓ Seen";
        if (msg.isDelivered) return "✓ Delivered";
        return "✓ Sent";
    };

    /* ===============================
        RENDER MESSAGE
    =============================== */
    const renderMessageContent = (msg) => {
        switch (msg.mediaType) {
            case "image":
                return <img src={msg.mediaUrl} alt="" style={styles.image} />;

            case "audio":
                return (
                    <audio controls style={styles.audio}>
                        <source src={msg.mediaUrl} />
                    </audio>
                );

            case "file":
                return (
                    <a
                        href={msg.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.file}
                    >
                        📎 {msg.mediaName || "Tải file"}
                    </a>
                );

            default:
                return msg.content;
        }
    };

    /* ===============================
        ✅ FIX QUAN TRỌNG:
        gộp + SORT theo createdAt
    =============================== */
    const allMessages = [
        ...messages,
        ...localMediaMessages.filter(
            (m) => !messages.some((x) => x.mediaUrl === m.mediaUrl)
        ),
    ].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    return (
        <div style={styles.chatBox}>
            {/* HEADER */}
            <div style={styles.header}>
                Chat với <b>{selectedUser.username}</b>
            </div>

            {/* MESSAGES */}
            <div style={styles.messages}>
                {allMessages.map((msg, index) => {
                    const isMe = msg.senderId === currentUserId;

                    return (
                        <div
                            key={msg._id || index}
                            style={{
                                ...styles.messageWrapper,
                                alignSelf: isMe ? "flex-end" : "flex-start",
                            }}
                        >
                            <div
                                style={{
                                    ...styles.message,
                                    backgroundColor: isMe ? "#daf8cb" : "#eee",
                                }}
                            >
                                {renderMessageContent(msg)}
                            </div>

                            {isMe && (
                                <div style={styles.status}>
                                    {renderStatus(msg)}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div style={styles.inputBox}>
                {/* IMAGE */}
                <label htmlFor="imageInput" style={styles.icon}>🖼️</label>
                <input
                    id="imageInput"
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                        handleUpload(e.target.files[0]);
                        e.target.value = "";
                    }}
                />

                {/* FILE / AUDIO */}
                <label htmlFor="fileInput" style={styles.icon}>📎</label>
                <input
                    id="fileInput"
                    type="file"
                    hidden
                    accept="audio/*,.pdf,.doc,.docx,.zip"
                    onChange={(e) => {
                        handleUpload(e.target.files[0]);
                        e.target.value = "";
                    }}
                />

                {/* TEXT */}
                <input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    style={styles.input}
                    onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
                />

                <button onClick={onSendMessage}>Gửi</button>
            </div>
        </div>
    );
}

/* ===============================
    STYLES
=============================== */
const styles = {
    chatBox: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    header: {
        padding: "10px",
        borderBottom: "1px solid #ddd",
    },
    messages: {
        flex: 1,
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        overflowY: "auto",
    },
    messageWrapper: {
        display: "flex",
        flexDirection: "column",
        maxWidth: "60%",
    },
    message: {
        padding: "8px 12px",
        borderRadius: "10px",
        wordBreak: "break-word",
    },
    status: {
        fontSize: "11px",
        color: "#777",
        marginTop: "2px",
        alignSelf: "flex-end",
    },
    inputBox: {
        display: "flex",
        padding: "10px",
        gap: "10px",
        borderTop: "1px solid #ddd",
        alignItems: "center",
    },
    input: {
        flex: 1,
        padding: "8px",
    },
    icon: {
        cursor: "pointer",
        fontSize: "20px",
    },
    image: {
        maxWidth: "220px",
        borderRadius: "8px",
    },
    audio: {
        width: "220px",
    },
    file: {
        color: "#0066cc",
        textDecoration: "none",
        fontWeight: "500",
    },
    empty: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
    },
};
