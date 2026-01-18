/**
 * @file messageController.js
 * @author moi
 * @description xử lý nghiệp vụ chat
 */
const Message = require("../models/Message");
const User = require("../models/User");

/**
 * Kiểm tra 2 user có follow nhau không
 * @param {String} currentUserId
 * @param {String} otherUserId
 * @returns {Boolean}
 */
const checkMutualFollow = async (currentUserId, otherUserId) => {
    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(otherUserId);

    if (!currentUser || !otherUser) return false;

    const isCurrentUserFollowing =
        currentUser.following.includes(otherUserId);

    const isOtherUserFollowing =
        otherUser.following.includes(currentUserId);

    return isCurrentUserFollowing && isOtherUserFollowing;
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

        // KIỂM TRA FOLLOW 2 CHIỀU
        const canChat = await checkMutualFollow(currentUserId, userId);
        if (!canChat) {
            return res.status(403).json({
                message: "You must follow each other to view chat history",
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
