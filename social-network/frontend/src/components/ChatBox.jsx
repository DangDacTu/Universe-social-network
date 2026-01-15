/**
 * @file ChatBox.jsx
 * Hiển thị tin nhắn + input gửi (text / image / file / audio / voice)
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

    const [localMediaMessages, setLocalMediaMessages] = useState([]);
    const [previewFiles, setPreviewFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    /* ================= VOICE ================= */
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);
    const streamRef = useRef(null);

    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isCancelRecording, setIsCancelRecording] = useState(false);

    /* ================= AUTO SCROLL ================= */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, localMediaMessages]);

    /* ================= OPEN CHAT ================= */
    useEffect(() => {
        if (!selectedUser) return;
        getSocket().emit("open-chat", { otherUserId: selectedUser._id });
    }, [selectedUser]);

    /* ================= SEEN ================= */
    useEffect(() => {
        if (!selectedUser || !messages.length) return;

        const unseen = messages.filter(
            (m) => m.senderId !== currentUserId && !m.isSeen
        );

        if (!unseen.length) return;

        getSocket().emit("message-seen", {
            messageIds: unseen.map((m) => m._id),
            senderId: selectedUser._id,
        });
    }, [messages, selectedUser, currentUserId]);

    /* ================= UPLOAD FILE ================= */
    const handleUpload = async (file) => {
        if (!file || !selectedUser) return;

        const res = await uploadApi.uploadFile(file);
        const socket = getSocket();

        let mediaType = "file";
        if (file.type.startsWith("image")) mediaType = "image";
        else if (file.type.startsWith("audio")) mediaType = "audio";

        const tempMessage = {
            _id: "temp-" + Date.now() + Math.random(),
            senderId: currentUserId,
            receiverId: selectedUser._id,
            content: "",
            mediaUrl: res.data.url,
            mediaType,
            mediaName: file.name,
            mediaMimeType: file.type,
            mediaSize: file.size,
            isDelivered: true,
            isSeen: false,
            createdAt: new Date().toISOString(),
        };

        setLocalMediaMessages((p) => [...p, tempMessage]);

        socket.emit("send-message", {
            receiverId: selectedUser._id,
            content: "",
            mediaUrl: res.data.url,
            mediaType,
            mediaName: file.name,
            mediaMimeType: file.type,
            mediaSize: file.size,
        });
    };

    /* ================= SEND PREVIEW IMAGES ================= */
    const sendPreviewImages = async () => {
        for (const file of previewFiles) {
            await handleUpload(file);
        }
        previewUrls.forEach((u) => URL.revokeObjectURL(u));
        setPreviewFiles([]);
        setPreviewUrls([]);
    };

    /* ================= VOICE ================= */
    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);

        streamRef.current = stream;
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        setRecordingTime(0);
        setIsCancelRecording(false);

        recorder.ondataavailable = (e) => {
            if (e.data.size) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
            clearInterval(recordingIntervalRef.current);

            if (isCancelRecording) {
                stream.getTracks().forEach((t) => t.stop());
                return;
            }

            const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            const file = new File([blob], `voice-${Date.now()}.webm`, {
                type: "audio/webm",
            });

            await handleUpload(file);
            stream.getTracks().forEach((t) => t.stop());
        };

        recorder.start();
        setIsRecording(true);

        recordingIntervalRef.current = setInterval(
            () => setRecordingTime((t) => t + 1),
            1000
        );
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    const cancelRecording = () => {
        setIsCancelRecording(true);
        mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
    };

    if (!selectedUser) {
        return <div style={styles.empty}>Chọn một người để bắt đầu chat</div>;
    }

    /* ================= MERGE ================= */
    const allMessages = [
        ...messages,
        ...localMediaMessages.filter(
            (m) => !messages.some((x) => x._id === m._id)
        ),
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const lastMyMessageId = [...allMessages]
        .filter((m) => m.senderId === currentUserId)
        .slice(-1)[0]?._id;

    return (
        <div style={styles.chatBox}>
            <div style={styles.header}>
                Chat với <b>{selectedUser.username}</b>
            </div>

            <div style={styles.messages}>
                {allMessages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <div
                            key={msg._id}
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
                                {msg.mediaType === "image" && (
                                    <img src={msg.mediaUrl} style={styles.image} />
                                )}

                                {msg.mediaType === "audio" && (
                                    <audio controls style={styles.audio}>
                                        <source src={msg.mediaUrl} />
                                    </audio>
                                )}

                                {msg.mediaType === "file" && (
                                    <a
                                        href={msg.mediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={styles.file}
                                    >
                                        {msg.mediaName}
                                    </a>
                                )}

                                {!msg.mediaUrl && (
                                    <span style={{ whiteSpace: "pre-wrap" }}>
                                        {msg.content}
                                    </span>
                                )}
                            </div>

                            {isMe && msg._id === lastMyMessageId && (
                                <div style={styles.status}>
                                    {msg.isSeen ? "Đã xem" : "Đã gửi"}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {previewUrls.length > 0 && (
                <div style={styles.previewBox}>
                    {previewUrls.map((url, idx) => (
                        <div key={idx} style={styles.previewItem}>
                            <img src={url} style={styles.previewImage} />
                            <button
                                style={styles.previewRemove}
                                onClick={() => {
                                    URL.revokeObjectURL(url);
                                    setPreviewFiles((f) => f.filter((_, i) => i !== idx));
                                    setPreviewUrls((u) => u.filter((_, i) => i !== idx));
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div style={styles.inputBox}>
                {/* VOICE */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        style={{
                            ...styles.icon,
                            color: isRecording ? "red" : "black",
                        }}
                    >
                        {isRecording ? "⏹️" : "🎤"}
                    </button>

                    {isRecording && (
                        <>
                            <span style={{ fontSize: "12px", color: "red", minWidth: "42px" }}>
                                {String(Math.floor(recordingTime / 60)).padStart(2, "0")}:
                                {String(recordingTime % 60).padStart(2, "0")}
                            </span>

                            <button
                                onClick={cancelRecording}
                                style={{
                                    fontSize: "12px",
                                    color: "#fff",
                                    background: "#ff4d4f",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "2px 6px",
                                    cursor: "pointer",
                                }}
                            >
                                ❌
                            </button>
                        </>
                    )}
                </div>

                <label htmlFor="imageInput" style={styles.icon}>🖼️</label>
                <input
                    id="imageInput"
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setPreviewFiles((p) => [...p, ...files]);
                        setPreviewUrls((p) => [
                            ...p,
                            ...files.map((f) => URL.createObjectURL(f)),
                        ]);
                        e.target.value = "";
                    }}
                />

                <label htmlFor="fileInput" style={styles.icon}>📎</label>
                <input
                    id="fileInput"
                    type="file"
                    hidden
                    accept="audio/*,.pdf,.doc,.docx,.zip"
                    onChange={(e) => {
                        if (e.target.files?.[0]) {
                            handleUpload(e.target.files[0]);
                        }
                        e.target.value = "";
                    }}
                />

                {/* ✅ TEXTAREA – ENTER / SHIFT+ENTER */}
                <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    style={{ ...styles.input, resize: "none" }}
                    rows={1}
                    onKeyDown={async (e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (previewFiles.length) {
                                await sendPreviewImages();
                                return;
                            }
                            if (messageInput.trim()) {
                                onSendMessage();
                            }
                        }
                    }}
                />

                <button
                    onClick={async () => {
                        if (previewFiles.length) {
                            await sendPreviewImages();
                            return;
                        }
                        if (messageInput.trim()) {
                            onSendMessage();
                        }
                    }}
                    style={{ ...styles.icon, color: "#0084ff", fontSize: "22px" }}
                >
                    📩
                </button>
            </div>
        </div>
    );
}

/* ================= STYLES (GIỮ NGUYÊN) ================= */
const styles = {
    chatBox: { flex: 1, display: "flex", flexDirection: "column" },
    header: { padding: "10px", borderBottom: "1px solid #ddd" },
    messages: {
        flex: 1,
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        overflowY: "auto",
    },
    messageWrapper: { maxWidth: "60%" },
    message: { padding: "8px 12px", borderRadius: "10px" },
    status: { fontSize: "11px", color: "#666", marginTop: "2px", textAlign: "right" },
    inputBox: {
        display: "flex",
        padding: "10px",
        gap: "10px",
        borderTop: "1px solid #ddd",
        alignItems: "center",
    },
    input: { flex: 1, padding: "8px" },
    icon: { cursor: "pointer", fontSize: "20px", background: "none", border: "none" },
    image: { maxWidth: "220px", borderRadius: "8px" },
    audio: { width: "220px" },
    file: { color: "#0066cc", textDecoration: "none" },
    empty: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    previewBox: {
        display: "flex",
        gap: "10px",
        padding: "10px",
        borderTop: "1px solid #ddd",
        flexWrap: "wrap",
    },
    previewItem: { position: "relative" },
    previewImage: {
        width: "90px",
        height: "90px",
        objectFit: "cover",
        borderRadius: "8px",
        border: "1px solid #ccc",
    },
    previewRemove: {
        position: "absolute",
        top: "-6px",
        right: "-6px",
        border: "none",
        background: "#ff4d4f",
        color: "#fff",
        borderRadius: "50%",
        width: "22px",
        height: "22px",
        cursor: "pointer",
    },
};
