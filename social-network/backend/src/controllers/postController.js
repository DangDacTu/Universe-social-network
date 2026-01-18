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
   DELETE POST
====================== */
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post không tồn tại" });
    }

    // 🔒 chỉ chủ post được xóa
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Không có quyền xóa post" });
    }

    await post.deleteOne();

    res.json({ message: "Xóa post thành công" });
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
   GET COMMENTS (🔥 FIXED)
====================== */
exports.getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .select("comments")
      .populate("comments.user", "username avatar")
      .populate("comments.replies.user", "username avatar");

    if (!post) {
      return res.status(404).json({ message: "Post không tồn tại" });
    }

    const userId = req.user.id.toString();

    const comments = post.comments.map((c) => ({
      ...c.toObject(),
      likeCount: c.likes.length,
      liked: c.likes.some((id) => id.toString() === userId),
      replyCount: c.replies?.length || 0,
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

    const userId = req.user.id.toString();

    const index = post.likes.findIndex(
      (id) => id.toString() === userId
    );

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
   🔥 TOGGLE LIKE COMMENT (FIXED)
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

    const userId = req.user.id.toString();

    const index = comment.likes.findIndex(
      (id) => id.toString() === userId
    );

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
      likes: [],
    });

    await post.save();
    await post.populate("comments.user", "username avatar");

    const newComment = post.comments.at(-1);

    res.status(201).json({
      ...newComment.toObject(),
      likeCount: 0,
      liked: false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   ADD REPLY (MULTI LEVEL)
====================== */
exports.addReply = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;
    const { content, parentReplyId = null, replyTo = null } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Nội dung trống" });
    }

    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ message: "Post không tồn tại" });

    const comment = post.comments.id(commentId);
    if (!comment)
      return res.status(404).json({ message: "Comment không tồn tại" });

    const newReply = {
      user: req.user.id,
      content,
      replyTo,
      replies: [],
    };

    // 🔥 Reply cấp 2 trở lên
    if (parentReplyId) {
      const parentReply = comment.replies.id(parentReplyId);
      if (!parentReply) {
        return res
          .status(404)
          .json({ message: "Reply cha không tồn tại" });
      }

      parentReply.replies.push(newReply);
    } else {
      // Reply cấp 1
      comment.replies.push(newReply);
    }

    await post.save();

    await post.populate(
      "comments.replies.user comments.replies.replyTo comments.replies.replies.user",
      "username avatar"
    );

    res.status(201).json(newReply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   🔥 DELETE COMMENT
====================== */
exports.deleteComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post không tồn tại" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment không tồn tại" });
    }

    const userId = req.user.id.toString();

    const isCommentOwner =
      comment.user.toString() === userId;

    const isPostOwner =
      post.author.toString() === userId;

    // 🔒 CHECK QUYỀN
    if (!isCommentOwner && !isPostOwner) {
      return res
        .status(403)
        .json({ message: "Không có quyền xóa comment" });
    }

    // 🔥 XÓA COMMENT
    comment.deleteOne();
    await post.save();

    res.json({
      message: "Xóa comment thành công",
      commentId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

