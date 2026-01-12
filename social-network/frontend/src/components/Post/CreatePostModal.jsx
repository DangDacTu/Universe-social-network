import { useState } from "react";
import "./post.css";
import axiosClient from "../../api/axiosClient";
import { FiImage } from "react-icons/fi";

const DEFAULT_AVATAR = "/avatar.jpg";
const MAX_MEDIA = 10; // 🔥 giới hạn media

export default function CreatePostModal({ onClose, onSuccess }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // HANDLE UPLOAD
  // =========================
  const handleSelectMedia = (e) => {
    const files = Array.from(e.target.files);

    if (media.length + files.length > MAX_MEDIA) {
      alert(`Chỉ được đăng tối đa ${MAX_MEDIA} ảnh / video`);
      return;
    }

    setMedia((prev) => [...prev, ...files]);
    e.target.value = ""; // reset input
  };

  // =========================
  // REMOVE MEDIA
  // =========================
  const handleRemoveMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    if (!content && media.length === 0) return;

    try {
      setLoading(true);
      const formData = new FormData();

      if (content) formData.append("content", content);

      media.forEach((file) => {
        formData.append("media", file);
      });

      await axiosClient.post("/posts", formData);

      setContent("");
      setMedia([]);

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error("CREATE POST ERROR:", err);
      alert("Đăng bài thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="modal-header">
          <button onClick={onClose}>Hủy</button>
          <span>Thread mới</span>
          <button
            className="submit"
            disabled={loading || (!content && media.length === 0)}
            onClick={handleSubmit}
          >
            {loading ? "Đang đăng..." : "Đăng"}
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          <div className="user-row">
            <img src={DEFAULT_AVATAR} className="avatar" />
            <textarea
              placeholder="Có gì mới?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 🔥 THREADS STYLE PREVIEW */}
          {media.length > 0 && (
            <div
              className={`preview-scroll ${media.length === 1 ? "single" : "multiple"
                }`}
            >
              {media.map((file, index) => (
                <div className="preview-item" key={index}>
                  {/* ❌ REMOVE */}
                  <button
                    className="preview-remove"
                    onClick={() => handleRemoveMedia(index)}
                  >
                    ✕
                  </button>

                  {file.type.startsWith("image") ? (
                    <img src={URL.createObjectURL(file)} />
                  ) : (
                    <video controls src={URL.createObjectURL(file)} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* UPLOAD */}
          <label className="media-btn">
            <FiImage size={22} />
            <input
              type="file"
              hidden
              multiple
              accept="image/*,video/*"
              onChange={handleSelectMedia}
            />
          </label>

          {/* COUNT */}
          {media.length > 0 && (
            <div
              style={{
                fontSize: 12,
                color: "#666",
                marginTop: 0,
                lineHeight: "12px",
                marginLeft: 5
              }}
            >
              {media.length}/{MAX_MEDIA}
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
