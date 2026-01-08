const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.post("/", protect, upload.single("media"), postController.createPost);
router.get("/", protect, postController.getAllPosts);

module.exports = router;
