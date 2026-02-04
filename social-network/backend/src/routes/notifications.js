const express = require("express");
const router = express.Router();
const { getMyNotifications, markAsRead } = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/", protect, getMyNotifications);
router.patch("/read", protect, markAsRead);

module.exports = router;
