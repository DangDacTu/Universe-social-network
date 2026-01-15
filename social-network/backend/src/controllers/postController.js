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

    if (req.files?.length > 0) {
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
      .populate("comments.user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   GET COMMENTS
====================== */
exports.getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .select("comments")
      .populate("comments.user", "username avatar");

    if (!post) {
      return res.status(404).json({ message: "Post không tồn tại" });
    }

    const comments = post.comments.map((c) => ({
      ...c.toObject(),
      likeCount: c.likes.length,
      liked: c.likes.includes(req.user.id),
    }));

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   TOGGLE LIKE POST
====================== */
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post không tồn tại" });
    }

    const index = post.likes.indexOf(req.user.id);

    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();

    res.json({
      liked: index === -1,
      likeCount: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   🔥 TOGGLE LIKE COMMENT
====================== */
exports.toggleLikeComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ message: "Post không tồn tại" });

    const comment = post.comments.id(commentId);
    if (!comment)
      return res.status(404).json({ message: "Comment không tồn tại" });

    const index = comment.likes.indexOf(req.user.id);

    if (index > -1) {
      comment.likes.splice(index, 1);
    } else {
      comment.likes.push(req.user.id);
    }

    await post.save();

    res.json({
      liked: index === -1,
      likeCount: comment.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   ADD COMMENT
====================== */
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content.trim()) {
      return res.status(400).json({ message: "Nội dung trống" });
    }

    const post = await Post.findById(req.params.id);

    post.comments.push({
      user: req.user.id,
      content,
    });

    await post.save();
    await post.populate("comments.user", "username avatar");

    res.status(201).json(post.comments.at(-1));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
