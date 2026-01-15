import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./commentModal.css";

const DEFAULT_AVATAR = "/avatar.jpg";

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
  const [replyingId, setReplyingId] = useState(null);

  /* ======================
     FETCH COMMENTS (LIKE THẬT)
  ====================== */
  useEffect(() => {
    axiosClient
      .get(`/posts/${postId}/comments`)
      .then((res) => setComments(res.data))
      .catch(console.error);
  }, [postId]);

  /* ======================
     🔥 TOGGLE LIKE COMMENT (REAL API)
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
     REPLY (UI – giữ nguyên)
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
      <div
        className="comment-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="comment-header">
          <span>Bình luận</span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="comment-list">
          {comments.map((c) => (
            <div key={c._id} className="comment-item">
              <img
                src={c.user?.avatar || DEFAULT_AVATAR}
                className="comment-avatar"
              />

              <div className="comment-right">
                <div className="comment-bubble">
                  <b className="comment-username">
                    {c.user?.username || "Người dùng"}
                  </b>
                  <p className="comment-content">
                    {c.content}
                  </p>
                </div>

                {/* META */}
                <div className="comment-meta">
                  <span>{timeAgo(c.createdAt)}</span>

                  {/* LIKE */}
                  <div
                    className={`comment-like ${
                      c.liked ? "liked" : ""
                    }`}
                    onClick={() => toggleLike(c._id)}
                  >
                    <HeartIcon />
                    {c.likeCount > 0 && (
                      <span>{c.likeCount}</span>
                    )}
                  </div>

                  {/* REPLY */}
                  <div
                    className="comment-reply"
                    onClick={() => toggleReply(c._id)}
                  >
                    <ReplyIcon />
                    {c.replyCount > 0 && (
                      <span>{c.replyCount}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="comment-input">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Viết bình luận..."
          />
          <button>Đăng</button>
        </div>
      </div>
    </div>
  );
}
