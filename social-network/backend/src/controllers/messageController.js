/**
 * @file messageController.js
 * @author moi
 * @description xử lý nghiệp vụ chat
 */
const Message = require("../models/Message");
/**
 * Lấy lịch sử chat giữa user hiện tại và user khác
 * @route GET /messages/:userId
 * @access private
 */
const getChatHistory = async (req, res) => {
    try {
        const currentUserId = req.user.id; // từ middleware auth
        const { userId } = req.params; // userId của người chat cùng

        //lấy tin nhắn theo 2 chiều gửi nhận
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