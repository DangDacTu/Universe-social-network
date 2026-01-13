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
  upload.array("media", 10),
  postController.createPost
);

// ======================
// GET ALL POSTS
// ======================
router.get("/", protect, postController.getAllPosts);

// ======================
// 🔥 GET COMMENTS (THREADS)
// ======================
router.get(
  "/:id/comments",
  protect,
  postController.getComments
);

// ======================
// 🔥 TOGGLE LIKE
// ======================
router.post(
  "/:id/like",
  protect,
  postController.toggleLike
);

// ======================
// 💬 ADD COMMENT
// ======================
router.post(
  "/:id/comments",
  protect,
  postController.addComment
);

// ======================
// 🗑 DELETE COMMENT
// ======================
router.delete(
  "/:id/comments/:commentId",
  protect,
  postController.deleteComment
);

module.exports = router;
