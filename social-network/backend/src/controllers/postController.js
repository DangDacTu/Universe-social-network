const Post = require("../models/Post");
const { createNotification } = require("./notificationController");
/* ======================
   CREATE POST (ĐÃ SỬA CHO CLOUDINARY)
====================== */
exports.createPost = async (req, res) => {
  try {
    const { content = "" } = req.body;

    // Kiểm tra: Phải có nội dung hoặc có file ảnh/video
    if (!content.trim() && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        message: "Bài viết phải có nội dung hoặc media",
      });
    }

    let media = [];

    // --- LOGIC MỚI: DÙNG CLOUDINARY ---
    if (req.files?.length > 0) {
      media = req.files.map((file) => {
        let type = "file";
        if (file.mimetype.startsWith("image")) type = "image";
        else if (file.mimetype.startsWith("video")) type = "video";
        else if (file.mimetype.startsWith("audio")) type = "audio";
        return { url: file.path, type };
      });
    }
    // ----------------------------------

    const post = await Post.create({
      author: req.user.id,
      content,
      media,
    });

    const populatedPost = await post.populate(
      "author",
      "username profilePicture" // Lưu ý: check lại model User của bạn là 'profilePicture' hay 'avatar' nhé
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

    // 🔒 Chỉ chủ post được xóa
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Không có quyền xóa post" });
    }

    // Lưu ý: Code này xóa post trong DB, nhưng ảnh trên Cloudinary vẫn còn.
    // Nếu muốn xóa sạch cả trên Cloudinary, cần dùng thư viện cloudinary.uploader.destroy() ở đây.
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
      .populate("author", "username profilePicture") // Đổi avatar -> profilePicture cho khớp model User
      .populate("comments.user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   GET USER POSTS (PROFILE) - MỚI THÊM
====================== */
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const posts = await Post.find({ author: userId })
      .populate("author", "username profilePicture")
      .populate("comments.user", "username profilePicture")
      .sort({ createdAt: -1 });

    if (!posts) {
        return res.status(404).json({ message: "Không tìm thấy bài viết nào" });
    }

    res.json(posts);
  } catch (error) {
    console.error("Lỗi lấy bài viết của user:", error);
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
      .populate("comments.user", "username profilePicture")
      .populate("comments.replies.user", "username profilePicture");

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
      // 🔥 TẠO THÔNG BÁO KHI CÓ LIKE MỚI
      createNotification({
        from: req.user.id,
        to: post.author,
        type: "like",
        post: post._id,
      });
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
   TOGGLE LIKE COMMENT
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
   ADD COMMENT (TEXT + IMAGE + VIDEO - CLOUDINARY)
====================== */
exports.addComment = async (req, res) => {
  try {
    const { content = "" } = req.body;

    // ❗ Phải có text hoặc có media
    if (!content.trim() && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        message: "Comment phải có nội dung hoặc media",
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post không tồn tại" });
    }

    // 🟢 XỬ LÝ MEDIA TỪ CLOUDINARY
    let media = [];
    if (req.files?.length > 0) {
      media = req.files.map((file) => {
        let type = "file";
        if (file.mimetype.startsWith("image")) type = "image";
        else if (file.mimetype.startsWith("video")) type = "video";
        else if (file.mimetype.startsWith("audio")) type = "audio";
        return { url: file.path, type };
      });
    }

    post.comments.push({
      user: req.user.id,
      content,
      media,
      likes: [],
    });

    await post.save();

    // Populate để frontend render ngay
    await post.populate("comments.user", "username profilePicture");

    const newComment = post.comments.at(-1);

    // 🔥 TẠO THÔNG BÁO KHI CÓ COMMENT MỚI
    createNotification({
      from: req.user.id,
      to: post.author,
      type: "comment",
      post: post._id,
      commentId: newComment._id,
    });
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

    // Reply cấp 2 trở lên
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
      "username profilePicture"
    );

    res.status(201).json(newReply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================
   DELETE COMMENT
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

    // XÓA COMMENT
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