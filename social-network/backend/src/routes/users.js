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
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Lay danh sach user
router.get('/', getAllUsers);

// Tim kiem user theo username
router.get('/search', searchUsers);

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

module.exports = router;
