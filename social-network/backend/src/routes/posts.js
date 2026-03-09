const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.post("/", protect, upload.array("media", 10), postController.createPost);
router.get("/", protect, postController.getAllPosts);

// DELETE POST
router.delete("/:id", protect, postController.deletePost);

// COMMENTS
router.get("/:id/comments", protect, postController.getComments);
router.post(
  "/:id/comments",
  protect,
  upload.array("media", 5),
  postController.addComment
);

// LIKE POST
router.post("/:id/like", protect, postController.toggleLike);

// LIKE COMMENT
router.post(
  "/:id/comments/:commentId/like",
  protect,
  postController.toggleLikeComment
);

// ADD REPLY
router.post(
  "/:id/comments/:commentId/replies",
  protect,
  postController.addReply
);

// DELETE COMMENT
router.delete(
  "/:id/comments/:commentId",
  protect,
  postController.deleteComment
);

// ROUTE LẤY BÀI VIẾT CỦA 1 USER
router.get("/user/:userId", protect, postController.getUserPosts);

module.exports = router;
