/**
 * @file Message.js
 * @author moi
 * @description Schema lưu tin nhắn chat 1-1
 */

const mongoose = require('mongoose');
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
        // nội dung tin nhắn
        content: {
            type: String,
            required: true,
        },
        // trạng thái đã đọc
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true } // tự động thêm createdAt và updatedAt
);
module.exports = mongoose.model("Message", messageSchema);