const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    followUser,
    unfollowUser,
    getAllUsers,
    getChatAvailableUsers,
    searchUsers,
    getUserFollowers,
    getUserFollowing,
    repostPost,
    getUserReposts,
    toggleSavePost,
    getSavedPosts,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Lay danh sach user
router.get('/', getAllUsers);

// Tim kiem user theo username
router.get('/search', searchUsers);

// 🔥 Lấy danh sách bài đã lưu (Đặt trước /:id để tránh trùng route)
router.get('/saved-posts', protect, getSavedPosts);

// Lay danh sach user co the chat (follow 2 chieu)
router.get('/chat-available', protect, getChatAvailableUsers);

// Lay thong tin user
router.get('/:id', getUserProfile);

// Cap nhat profile (can login)
router.put('/:id', protect, updateUserProfile);

// Follow user
router.put('/:id/follow', protect, followUser);

// Unfollow user
router.put('/:id/unfollow', protect, unfollowUser);

// Lay danh sach followers va following cua user (co the dung de hien thi o profile)
router.get("/:id/followers", getUserFollowers);

// Lay danh sach following cua user
router.get("/:id/following", getUserFollowing);

// 🔥 Đăng lại bài viết (Repost)
router.post('/repost/:id', protect, repostPost);

// 🔥 Lấy danh sách bài đăng lại của user
router.get('/:id/reposts', getUserReposts);

// 🔥 Lưu / Bỏ lưu bài viết
router.put('/save/:id', protect, toggleSavePost);

module.exports = router;
