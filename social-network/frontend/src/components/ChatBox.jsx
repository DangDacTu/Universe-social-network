/**
 * @file ChatBox.jsx
 * Hiển thị tin nhắn + input gửi (text / image / file / audio / voice)
 */

import { useEffect, useRef, useState } from "react";
import { getSocket } from "../services/socket";
import uploadApi from "../api/uploadApi";
import "./ChatBox.css";

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
        return <div className="empty">Chọn một người để bắt đầu chat</div>;
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
        <div className="chatBox">
            <div className="header">
                Chat với <b>{selectedUser.username}</b>
            </div>

            <div className="messages">
                {allMessages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    const noBubble =
                        msg.mediaType === "image" || msg.mediaType === "audio";

                    return (
                        <div
                            key={msg._id}
                            className={`messageWrapper ${isMe ? "me" : ""}`}
                        >
                            <div
                                className={`message ${noBubble ? "noBubble" : ""} ${isMe ? "me" : ""}`}
                            >
                                {msg.mediaType === "image" && (
                                    <img src={msg.mediaUrl} className="image" />
                                )}

                                {msg.mediaType === "audio" && (
                                    <audio controls className="audio">
                                        <source src={msg.mediaUrl} />
                                    </audio>
                                )}

                                {msg.mediaType === "file" && (
                                    <a
                                        href={msg.mediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="file"
                                    >
                                        {msg.mediaName}
                                    </a>
                                )}

                                {!msg.mediaUrl && (
                                    <span className="text">{msg.content}</span>
                                )}
                            </div>

                            {isMe && msg._id === lastMyMessageId && (
                                <div className="status">
                                    {msg.isSeen ? "Đã xem" : "Đã gửi"}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {previewUrls.length > 0 && (
                <div className="previewBox">
                    {previewUrls.map((url, idx) => (
                        <div key={idx} className="previewItem">
                            <img src={url} className="previewImage" />
                            <button
                                className="previewRemove"
                                onClick={() => {
                                    URL.revokeObjectURL(url);
                                    setPreviewFiles((f) =>
                                        f.filter((_, i) => i !== idx)
                                    );
                                    setPreviewUrls((u) =>
                                        u.filter((_, i) => i !== idx)
                                    );
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="inputBox">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`icon ${isRecording ? "recording" : ""}`}
                >
                    {isRecording ? "⏹️" : "🎤"}
                </button>

                {isRecording && (
                    <>
                        <span className="recordingTime">
                            {String(Math.floor(recordingTime / 60)).padStart(2, "0")}:
                            {String(recordingTime % 60).padStart(2, "0")}
                        </span>
                        <button onClick={cancelRecording} className="cancelRecord">
                            ❌
                        </button>
                    </>
                )}

                <label htmlFor="imageInput" className="icon">🖼️</label>
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

                <label htmlFor="fileInput" className="icon">📎</label>
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

                <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="input"
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
                    className="icon send"
                >
                    📩
                </button>
            </div>
        </div>
    );
}
