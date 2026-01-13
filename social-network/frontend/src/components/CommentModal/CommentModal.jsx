import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./commentModal.css";

const DEFAULT_AVATAR = "/avatar.jpg";

export default function CommentModal({
  postId,
  onClose,
  onCommentAdded,
}) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  /* ======================
     FETCH COMMENTS
  ====================== */
  useEffect(() => {
    axiosClient
      .get(`/posts/${postId}/comments`)
      .then((res) => setComments(res.data))
      .catch((err) =>
        console.error("FETCH COMMENT ERROR:", err)
      );
  }, [postId]);

  /* ======================
     SUBMIT COMMENT
  ====================== */
  const submitComment = async () => {
    if (!text.trim() || loading) return;

    try {
      setLoading(true);

      const res = await axiosClient.post(
        `/posts/${postId}/comments`,
        { content: text }
      );

      // append comment mới
      setComments((prev) => [...prev, res.data]);

      // tăng counter bên PostItem
      onCommentAdded && onCommentAdded();

      setText("");
    } catch (err) {
      console.error("COMMENT ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment-overlay" onClick={onClose}>
      <div
        className="comment-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="comment-header">
          <span>Bình luận</span>
          <button onClick={onClose}>✕</button>
        </div>

        {/* LIST */}
        <div className="comment-list">
          {comments.length === 0 && (
            <p className="no-comment">
              Chưa có bình luận nào
            </p>
          )}

          {comments.map((c) => (
            <div key={c._id} className="comment-item">
              <div style={{ display: "flex", gap: 8 }}>
                <img
                  src={c.user?.avatar || DEFAULT_AVATAR}
                  alt="avatar"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                <div>
                  <b>{c.user?.username || "Người dùng"}</b>
                  <p>{c.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="comment-input">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Viết bình luận..."
            onKeyDown={(e) =>
              e.key === "Enter" && submitComment()
            }
          />
          <button
            onClick={submitComment}
            disabled={loading}
          >
            {loading ? "..." : "Đăng"}
          </button>
        </div>
      </div>
    </div>
  );
}
