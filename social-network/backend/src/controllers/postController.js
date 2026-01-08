const Post = require("../models/Post");

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content && !req.file) {
      return res.status(400).json({
        message: "Bài viết phải có nội dung hoặc media",
      });
    }

    let media = null;
    let mediaType = null;

    if (req.file) {
      media = `/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith("image")
        ? "image"
        : "video";
    }

    const post = await Post.create({
      author: req.user.id,
      content,
      media,
      mediaType,
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
    res.status(500).json({ message: error.message });
  }
};
