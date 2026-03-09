const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    getUserSettings,
    updateUserSettings,
    changePassword,
} = require('../controllers/settingsController');

// Lấy cài đặt
router.get('/', protect, getUserSettings);
// Cập nhật cài đặt
router.put('/', protect, updateUserSettings);
// Đổi mật khẩu
router.put('/change-password', protect, changePassword);

module.exports = router;