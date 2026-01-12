const Post = require("../models/Post");

/* ======================
   CREATE POST
====================== */
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        message: "Bài viết phải có nội dung hoặc media",
      });
    }

    let media = [];

    if (req.files && req.files.length > 0) {
      media = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        type: file.mimetype.startsWith("image") ? "image" : "video",
      }));
    }

    const post = await Post.create({
      author: req.user.id,
      content,
      media,
    });

    const populatedPost = await post.populate(
      "author",
      "username avatar"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   GET ALL POSTS
====================== */
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   🔥 TOGGLE LIKE (THREADS)
====================== */
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post không tồn tại" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // UNLIKE
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // LIKE
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      liked: !isLiked,
      likeCount: post.likes.length,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ message: error.message });
  }
};
