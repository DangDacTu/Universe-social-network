const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, followUser, unfollowUser, getAllUsers, searchUsers } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// ==================================================================
// CÁC ROUTE CỤ THỂ ĐẶT LÊN TRÊN CÙNG
// ==================================================================

// 1. Tìm kiếm người dùng
router.get('/search', searchUsers);

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