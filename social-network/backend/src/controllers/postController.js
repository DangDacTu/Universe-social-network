const Post = require("../models/Post");

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;

    // 🔥 kiểm tra có nội dung hoặc có file
    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        message: "Bài viết phải có nội dung hoặc media",
      });
    }

    let media = [];

    // 🔥 xử lý nhiều file
    if (req.files && req.files.length > 0) {
      media = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        type: file.mimetype.startsWith("image") ? "image" : "video",
      }));
    }

    const post = await Post.create({
      author: req.user.id,
      content,
      media, // 🔥 mảng media
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
