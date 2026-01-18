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
const { getUserProfile, updateUserProfile, followUser, unfollowUser, getAllUsers, searchUsers } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// ==================================================================
// CÁC ROUTE CỤ THỂ ĐẶT LÊN TRÊN CÙNG
// ==================================================================

// 1. Tìm kiếm người dùng
router.get('/search', searchUsers);

// Follow user
router.put('/:id/follow', protect, followUser);

// Unfollow use
// 2. Lấy danh sách tất cả user
router.get("/", getAllUsers);

// ==================================================================
// CÁC ROUTE CÓ THAM SỐ (:id) ĐẶT Ở DƯỚI CÙNG
// ==================================================================

// 3. Lấy thông tin user theo ID
router.get('/:id', getUserProfile);

// 4. Cập nhật profile
router.put('/:id', protect, updateUserProfile);

// 5. Follow user
router.put('/:id/follow', protect, followUser);

// 6. Unfollow user
router.put('/:id/unfollow', protect, unfollowUser);

module.exports = router;