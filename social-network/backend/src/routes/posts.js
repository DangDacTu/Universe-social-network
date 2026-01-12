const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// ======================
// CREATE POST (MULTI MEDIA)
// ======================
router.post(
  "/",
  protect,
  upload.array("media", 10), // tối đa 10 file
  postController.createPost
);

// ======================
// GET ALL POSTS
// ======================
router.get("/", protect, postController.getAllPosts);

// ======================
// 🔥 TOGGLE LIKE (THREADS)
// ======================
router.post(
  "/:id/like",
  protect,
  postController.toggleLike
);

module.exports = router;
