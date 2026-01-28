/**
 * @file Message.js
 * @author moi
 * @description Schema lưu tin nhắn chat 1-1
 */

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        // người gửi
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // người nhận
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // nội dung tin nhắn (text)
        // ❗ không required để hỗ trợ image / file / voice
        content: {
            type: String,
            default: "",
        },

        // =========================
        // MEDIA (IMAGE/ VIDEO / FILE / VOICE)
        // =========================
        mediaUrl: {
            type: String, // link Cloudinary
            default: "",
        },

        mediaPublicId: {
            type: String, // public_id của Cloudinary (để xoá)
            default: "",
        },

        mediaType: {
            type: String,
            enum: ["text", "image", "video", "file", "audio"],
            default: "text",
        },

        mediaName: {
            type: String, // tên file gốc (pdf, mp3…)
            default: "",
        },

        mediaMimeType: {
            type: String, // image/png, audio/mp3, application/pdf
            default: "",
        },

        mediaSize: {
            type: Number, // bytes
            default: 0,
        },

        audioDuration: {
            type: Number, // giây (chỉ dùng cho voice)
            default: 0,
        },

        // =========================
        // TRẠNG THÁI TIN NHẮN
        // =========================

        // đã đọc (REST API)
        isRead: {
            type: Boolean,
            default: false,
        },

        // đã gửi tới client người nhận
        isDelivered: {
            type: Boolean,
            default: false,
        },

        // người nhận đã mở cuộc chat
        isSeen: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

module.exports = mongoose.model("Message", messageSchema);
