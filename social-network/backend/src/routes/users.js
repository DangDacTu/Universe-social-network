const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, followUser, unfollowUser, getAllUsers, getChatAvailableUsers, } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Lấy danh sách user
router.get("/", getAllUsers);

// Lấy danh sách user có thể chat (FOLLOW LẪN NHAU)
router.get("/chat-available", protect, getChatAvailableUsers);

// Lấy thông tin user (Ai cũng xem được hoặc cần login tùy bạn, ở đây để public xem profile)
router.get('/:id', getUserProfile);

// Cập nhật profile (Phải login -> protect middleware)
router.put('/:id', protect, updateUserProfile);

// Follow user
router.put('/:id/follow', protect, followUser);

// Unfollow user
router.put('/:id/unfollow', protect, unfollowUser);

module.exports = router;