const express = require('express');
const router = express.Router();
const { 
    getUserProfile, 
    updateUserProfile, 
    followUser, 
    unfollowUser, 
    getAllUsers, 
    searchUsers,            // <--- Import thêm Search
    getChatAvailableUsers   // <--- Import thêm Chat
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// ==================================================================
// ⚠️ QUAN TRỌNG: CÁC ROUTE CỤ THỂ PHẢI ĐẶT LÊN TRÊN CÙNG
// ==================================================================

// 1. Tìm kiếm người dùng (Phải đặt ĐẦU TIÊN để không bị nhận nhầm là ID)
router.get('/search', searchUsers);

// 2. Lấy danh sách user có thể chat (Follow lẫn nhau)
router.get("/chat-available", protect, getChatAvailableUsers);

// 3. Lấy danh sách tất cả user
router.get("/", getAllUsers);

// ==================================================================
// 👇 CÁC ROUTE CÓ THAM SỐ (:id) PHẢI ĐẶT Ở DƯỚI CÙNG 👇
// ==================================================================

// 4. Lấy thông tin user theo ID
router.get('/:id', getUserProfile);

// 5. Cập nhật profile
router.put('/:id', protect, updateUserProfile);

// 6. Follow user
router.put('/:id/follow', protect, followUser);

// 7. Unfollow user
router.put('/:id/unfollow', protect, unfollowUser);

module.exports = router;