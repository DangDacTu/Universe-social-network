import { useEffect, useState, useRef } from "react";
import axiosClient from "../../api/axiosClient";
import { FiMoreHorizontal, FiTrash2, FiImage } from "react-icons/fi";
import "./commentModal.css";

/* ======================
   TIME AGO
====================== */
function timeAgo(date) {
  const seconds = Math.floor(
    (Date.now() - new Date(date)) / 1000
  );
  if (seconds < 60) return "Vừa xong";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} tuần`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng`;
  const years = Math.floor(days / 365);
  return `${years} năm`;
}

/* ======================
   ICONS
====================== */
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M16.697 5.5c-1.222 0-2.444.489-3.366 1.467L12 8.414l-1.331-1.447C9.747 5.989 8.525 5.5 7.303 5.5 4.957 5.5 3 7.432 3 9.75c0 1.284.586 2.497 1.607 3.328l6.646 5.425a1.1 1.1 0 001.494 0l6.646-5.425A4.252 4.252 0 0021 9.75c0-2.318-1.957-4.25-4.303-4.25z"
      fill="currentColor"
    />
  </svg>
);

const ReplyIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
  </svg>
);

export default function CommentModal({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]); 
  const [previews, setPreviews] = useState([]);
  const [replyingId, setReplyingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* ====== STATE CHO XÓA COMMENT ====== */
  const [openMenuId, setOpenMenuId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  /* ====== THÊM CHO SCROLL + HIGHLIGHT ====== */
  const commentListRef = useRef(null);
  const fileInputRef = useRef(null); 
  const [newCommentId, setNewCommentId] = useState(null);

  /* ======================
     FETCH COMMENTS
  ====================== */
  useEffect(() => {
    axiosClient
      .get(`/posts/${postId}/comments`)
      .then((res) => setComments(res.data))
      .catch(console.error);
  }, [postId]);

  /* ======================
     TOGGLE LIKE COMMENT
  ====================== */
  const toggleLike = async (commentId) => {
    try {
      const res = await axiosClient.post(
        `/posts/${postId}/comments/${commentId}/like`
      );

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
              ...c,
              liked: res.data.liked,
              likeCount: res.data.likeCount,
            }
            : c
        )
      );
    } catch (err) {
      console.error("Like comment error:", err);
    }
  };

  /* ======================
     SUBMIT COMMENT (TEXT + IMAGE/VIDEO)
  ====================== */
  const handleSubmitComment = async () => {
    if ((!text.trim() && files.length === 0) || submitting) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append("content", text);
      files.forEach((f) => formData.append("media", f));

      const res = await axiosClient.post(
        `/posts/${postId}/comments`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setComments((prev) => [...prev, res.data]);

      setTimeout(() => {
        commentListRef.current?.scrollTo({
          top: commentListRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);

      setNewCommentId(res.data._id);
      setTimeout(() => setNewCommentId(null), 1500);

      setText("");
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error("Create comment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const removePreview = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));

    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  /* ======================
     DELETE COMMENT
  ====================== */
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Xóa bình luận này?")) return;

    setRemovingId(commentId);

    try {
      await axiosClient.delete(
        `/posts/${postId}/comments/${commentId}`
      );

      setTimeout(() => {
        setComments((prev) =>
          prev.filter((c) => c._id !== commentId)
        );
      }, 200);
    } catch (err) {
      console.error("Delete comment error:", err);
      setRemovingId(null);
    }
  };

  /* ======================
     REPLY (GIỮ NGUYÊN)
  ====================== */
  const toggleReply = (id) => {
    setReplyingId(replyingId === id ? null : id);

    setComments((prev) =>
      prev.map((c) =>
        c._id === id
          ? { ...c, replyCount: (c.replyCount || 0) + 1 }
          : c
      )
    );
  };

  return (
    <div className="comment-overlay" onClick={onClose}>
      <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comment-header">
          <span>Bình luận</span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="comment-list" ref={commentListRef}>
          {comments.map((c) => (
            <div
              key={c._id}
              className={`comment-item
                ${removingId === c._id ? "comment-removing" : ""}
                ${newCommentId === c._id ? "comment-new" : ""}`}
            >
              <img
                src={c.user?.profilePicture || DEFAULT_AVATAR}
                className="comment-avatar"
              />

              <div className="comment-right">
                <div className="comment-bubble">
                  <b className="comment-username">
                    {c.user?.username || "Người dùng"}
                  </b>

                  {c.content && (
                    <p className="comment-content">{c.content}</p>
                  )}

                  {/* CHỈ THÊM MEDIA – KHÔNG ĐỔI LAYOUT */}
                  {c.media?.length > 0 &&
                    c.media.map((m, i) =>
                      m.type === "image" ? (
                        <img
                          key={i}
                          src={m.url}
                          className="comment-media-img"
                        />
                      ) : (
                        <video
                          key={i}
                          src={m.url}
                          controls
                          className="comment-media-video"
                        />

                      )
                    )}
                </div>

                <div className="comment-meta">
                  <span>{timeAgo(c.createdAt)}</span>

                  <div
                    className={`comment-like ${c.liked ? "liked" : ""}`}
                    onClick={() => toggleLike(c._id)}
                  >
                    <HeartIcon />
                    {c.likeCount > 0 && <span>{c.likeCount}</span>}
                  </div>

                  <div
                    className="comment-reply"
                    onClick={() => toggleReply(c._id)}
                  >
                    <ReplyIcon />
                    {c.replyCount > 0 && <span>{c.replyCount}</span>}
                  </div>
                </div>
              </div>

              <div className="comment-menu">
                <button
                  className="comment-menu-btn"
                  onClick={() =>
                    setOpenMenuId(openMenuId === c._id ? null : c._id)
                  }
                >
                  <FiMoreHorizontal size={16} />
                </button>

                {openMenuId === c._id && (
                  <div className="comment-menu-dropdown">
                    <button
                      className="comment-menu-delete"
                      onClick={() => handleDeleteComment(c._id)}
                    >
                      <FiTrash2 />
                      <span>Xóa</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {previews.length > 0 && (
          <div className="comment-preview-row">
            {previews.map((p, index) => (
              <div key={index} className="comment-preview-item">
                {p.type === "image" ? (
                  <img src={p.url} />
                ) : (
                  <video src={p.url} />
                )}

                <button
                  className="comment-preview-remove"
                  onClick={() => removePreview(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}


        {/* INPUT – chỉ thêm nút chọn file */}
        <div className="comment-input">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Viết bình luận..."
            disabled={submitting}
          />

          <input
            type="file"
            hidden
            multiple
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              // chỉ cho 1 file
              setFiles([file]);

              setPreviews([
                {
                  file,
                  url: URL.createObjectURL(file),
                  type: file.type.startsWith("image") ? "image" : "video",
                },
              ]);

              // reset input
              e.target.value = null;

            }}

          />

          <button
            className={`comment-image-btn ${files.length >= 1 ? "disabled" : ""}`}
            onClick={() => fileInputRef.current.click()}
            disabled={files.length >= 1}
          >
            <FiImage size={20} />
          </button>


          <button onClick={handleSubmitComment} disabled={submitting}>
            {submitting ? "Đang gửi..." : "Đăng"}
          </button>
        </div>
      </div>
    </div>
  );
}
