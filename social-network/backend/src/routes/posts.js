const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// 🔥 upload nhiều file
router.post(
  "/",
  protect,
  upload.array("media", 10), // tối đa 10 file
  postController.createPost
);

router.get("/", protect, postController.getAllPosts);

module.exports = router;
