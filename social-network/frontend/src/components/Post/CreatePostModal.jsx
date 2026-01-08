import { useState } from "react";
import "./post.css";
import axiosClient from "../../api/axiosClient";

export default function CreatePostModal({ onClose, onSuccess }) {
  // Nội dung bài viết
  const [content, setContent] = useState("");

  // Ảnh / video
  const [media, setMedia] = useState(null);

  // Trạng thái loading khi đăng
  const [loading, setLoading] = useState(false);

  // ===============================
  // HANDLE SUBMIT
  // ===============================
  const handleSubmit = async () => {
    // ❗ Không có nội dung & media → không cho đăng
    if (!content && !media) return;

    try {
      setLoading(true);

      // Tạo FormData để gửi multipart/form-data
      const formData = new FormData();

      if (content) {
        formData.append("content", content);
      }

      if (media) {
        formData.append("media", media);
      }

      // Gọi API tạo post
      await axiosClient.post("/posts", formData);

      // Reset form
      setContent("");
      setMedia(null);

      // 🔥 Báo cho Home reload lại PostList
      if (onSuccess) onSuccess();

      // Đóng modal
      onClose();
    } catch (err) {
      console.error("CREATE POST ERROR:", err);
      alert("Đăng bài thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="modal-header">
          <button onClick={onClose}>Hủy</button>
          <span>Thread mới</span>
          <button
            className="submit"
            disabled={loading || (!content && !media)}
            onClick={handleSubmit}
          >
            {loading ? "Đang đăng..." : "Đăng"}
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          <div className="user-row">
            <img src="/avatar.png" className="avatar" alt="avatar" />
            <textarea
              placeholder="Có gì mới?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* PREVIEW MEDIA */}
          {media && (
            <div className="preview">
              {media.type.startsWith("image") ? (
                <img src={URL.createObjectURL(media)} alt="preview" />
              ) : (
                <video controls src={URL.createObjectURL(media)} />
              )}
            </div>
          )}

          {/* UPLOAD BUTTON */}
          <label className="media-btn">
            📎
            <input
              type="file"
              hidden
              accept="image/*,video/*"
              onChange={(e) => setMedia(e.target.files[0])}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
