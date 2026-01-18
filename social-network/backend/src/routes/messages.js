/**
 * Route cho chức năng chat
 */
const express = require("express");
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { getChatHistory } = require("../controllers/messageController");

// Lấy lịch sử chat
router.get("/:userId", protect, getChatHistory);

module.exports = router;
