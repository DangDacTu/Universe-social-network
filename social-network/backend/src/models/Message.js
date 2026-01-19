const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: "" },
    
    // MEDIA
    mediaUrl: { type: String, default: "" },
    mediaType: { 
        type: String, 
        // 👇 THÊM 'video' VÀO ĐÂY
        enum: ["text", "image", "audio", "video"], 
        default: "text" 
    },
    
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);