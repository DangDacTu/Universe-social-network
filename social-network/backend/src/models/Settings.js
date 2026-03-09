const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    // Cài đặt quyền riêng tư
    isPrivateAccount: {
        type: Boolean,
        default: false,
    },
    // Giao diện: màu nền / ảnh nền
    background: { type: String, default: "" },
    backgroundType: { type: String, default: "color" },
},
    {
        timestamps: true,//createdAt, updatedAt
    });
module.exports = mongoose.model('Settings', SettingsSchema);