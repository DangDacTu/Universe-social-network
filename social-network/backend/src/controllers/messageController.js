/**
 * @file messageController.js
 * @author moi
 * @description xử lý nghiệp vụ chat
 */
const Message = require("../models/Message");
const User = require("../models/User");

/**
 * Kiểm tra quyền chat: Chỉ cần 1 chiều follow là có thể chat
 * (A follow B -> A nhắn được cho B, B nhận được tin nhắn chờ và có thể reply)
 * @param {String} currentUserId
 * @param {String} otherUserId
 * @returns {Boolean}
 */
const checkCanChat = async (currentUserId, otherUserId) => {
    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(otherUserId);

    if (!currentUser || !otherUser) return false;

    // Cho phép chat nếu:
    // 1. Mình follow họ (Mình gửi tin nhắn đi)
    // 2. Họ follow mình (Họ gửi tin nhắn đến -> Tin nhắn chờ)
    const isFollowing = currentUser.following.includes(otherUserId);
    const isFollowedBy = currentUser.followers.includes(otherUserId);

    return isFollowing || isFollowedBy;
};

/**
 * Lấy lịch sử chat giữa user hiện tại và user khác
 * @route GET /messages/:userId
 * @access private
 */
const getChatHistory = async (req, res) => {
    try {
        const currentUserId = req.user.id; // từ middleware auth
        const { userId } = req.params; // userId của người chat cùng

        // KIỂM TRA QUYỀN CHAT (1 CHIỀU LÀ ĐỦ)
        const canChat = await checkCanChat(currentUserId, userId);
        if (!canChat) {
            return res.status(403).json({
                message: "Bạn phải theo dõi người dùng này hoặc được họ theo dõi để nhắn tin",
            });
        }

        // Lấy tin nhắn theo 2 chiều gửi nhận
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId },
            ],
        }).sort({ createdAt: 1 }); // sắp xếp theo thời gian tăng dần

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getChatHistory };