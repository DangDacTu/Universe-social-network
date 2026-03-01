const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getMyNotifications,
  markAsRead,
} = require("../controllers/notificationController");

// Lấy danh sách thông báo
router.get("/", protect, getMyNotifications);

// Đánh dấu đã đọc
router.patch("/read", protect, markAsRead);

module.exports = router;
