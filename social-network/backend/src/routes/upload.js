// File mới hoàn toàn
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const { uploadFile } = require("../controllers/uploadController");
const { protect } = require("../middlewares/authMiddleware");

// Route này chỉ dùng để upload file (cho Chat, Setting, v.v.)
// upload.array("media", 1) nghĩa là chỉ cho upload 1 file mỗi lần gọi
router.post("/", protect, upload.array("media", 1), uploadFile);

module.exports = router;
