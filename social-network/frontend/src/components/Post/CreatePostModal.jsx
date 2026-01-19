import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { FiImage, FiX } from "react-icons/fi"; // Import icon đóng và ảnh
import "./post.css"; // Đảm bảo bạn đã có file css

const DEFAULT_AVATAR = "/avatar.jpg";
const MAX_MEDIA = 10; // Giới hạn số lượng ảnh/video

export default function CreatePostModal({ onClose, onSuccess }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Lấy thông tin user hiện tại để hiển thị avatar
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.error("Lỗi đọc user từ local storage");
    }
  }, []);

  // =========================
  // XỬ LÝ CHỌN ẢNH/VIDEO
  // =========================
  const handleSelectMedia = (e) => {
    const files = Array.from(e.target.files);

    if (media.length + files.length > MAX_MEDIA) {
      alert(`Chỉ được đăng tối đa ${MAX_MEDIA} ảnh / video`);
      return;
    }

    // Nối thêm file mới vào danh sách cũ
    setMedia((prev) => [...prev, ...files]);
    
    // Reset input để chọn lại được file cũ nếu muốn
    e.target.value = ""; 
  };

  // =========================
  // XÓA ẢNH/VIDEO ĐÃ CHỌN
  // =========================
  const handleRemoveMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================
  // GỬI DỮ LIỆU (QUAN TRỌNG)
  // =========================
  const handleSubmit = async () => {
    // 1. Kiểm tra phải có nội dung hoặc ảnh
    if (!content.trim() && media.length === 0) {
      return alert("Bạn chưa nhập nội dung!");
    }

    try {
      setLoading(true);

      // 2. Tạo FormData
      const formData = new FormData();
      
      // Thêm text
      if (content.trim()) {
        formData.append("content", content);
      }

      // Thêm từng file media với tên trường là "media"
      // Tên này phải khớp với upload.array("media") ở Backend
      media.forEach((file) => {
        formData.append("media", file);
      });

      // 3. Gọi API với Header multipart/form-data
      await axiosClient.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 4. Thành công
      setContent("");
      setMedia([]);
      if (onSuccess) onSuccess(); // Load lại danh sách bài viết
      onClose(); // Đóng modal

    } catch (err) {
      console.error("CREATE POST ERROR:", err);
      alert(`Đăng bài thất bại: ${err.response?.data?.message || "Lỗi server"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="modal-header">
          <button onClick={onClose} className="cancel-btn">Hủy</button>
          <span className="modal-title">Thread mới</span>
          <button
            className="submit-btn"
            disabled={loading || (!content.trim() && media.length === 0)}
            onClick={handleSubmit}
          >
            {loading ? "Đang đăng..." : "Đăng"}
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          <div className="post-input-area">
            <div className="avatar-wrapper">
               <img 
                 src={currentUser?.profilePicture || currentUser?.avatar || DEFAULT_AVATAR} 
                 className="avatar" 
                 alt="User Avatar"
                 onError={(e) => e.target.src = DEFAULT_AVATAR}
               />
            </div>
            
            <div className="input-wrapper">
                <span className="username-label">{currentUser?.username}</span>
                <textarea
                  placeholder="Có gì mới?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  autoFocus
                />
            </div>
          </div>

          {/* MEDIA PREVIEW */}
          {media.length > 0 && (
            <div className={`preview-scroll ${media.length === 1 ? "single" : "multiple"}`}>
              {media.map((file, index) => (
                <div className="preview-item" key={index}>
                  {/* Nút xóa ảnh */}
                  <button
                    className="preview-remove"
                    onClick={() => handleRemoveMedia(index)}
                  >
                    <FiX />
                  </button>

                  {/* Hiển thị ảnh hoặc video */}
                  {file.type.startsWith("image") ? (
                    <img src={URL.createObjectURL(file)} alt="preview" />
                  ) : (
                    <video controls src={URL.createObjectURL(file)} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="modal-footer-actions">
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
             
             {media.length > 0 && (
               <span className="media-count">
                 {media.length}/{MAX_MEDIA}
               </span>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}