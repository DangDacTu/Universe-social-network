import { useState, useEffect, useRef } from "react";
import "./post.css";
import axiosClient from "../../api/axiosClient";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiMessageCircle, FiMoreHorizontal, FiRepeat, FiSend, FiBookmark } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { FaBookmark } from "react-icons/fa"; // Icon bookmark đặc
import CommentModal from "../CommentModal/CommentModal";
import { FiTrash2 } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext"; // 🔥 Import useAuth
import userApi from "../../api/userApi";
import ShareModal from "../ShareModal/ShareModal"; // Import ShareModal

// 1. SỬA: Xóa dòng BACKEND_URL vì Cloudinary dùng link tuyệt đối
// const BACKEND_URL = "http://localhost:5000"; 
const DEFAULT_AVATAR = "/avatar.jpg";

export default function PostItem({ post, onDeleted }) {
  // 2. THÊM: Dòng này bắt buộc để tránh lỗi màn hình đen khi dữ liệu chưa tải xong
  if (!post) return null;
  const navigate = useNavigate();
  const { user, updateUser } = useAuth(); // 🔥 Lấy user từ context

  // 🔥 CHUYỂN LÊN ĐẦU: Xác định bài viết hiển thị (Bài gốc hay bài repost)
  // Để các state bên dưới (commentCount) có thể dùng dữ liệu của bài gốc
  const isRepost = !!post.repostData;
  const displayPost = isRepost ? post.repostData : post;

  // Nếu là repost mà không có data bài gốc (bài gốc bị xóa), ẩn luôn
  if (isRepost && !displayPost) return null;

  const [activeIndex, setActiveIndex] = useState(null);

  const currentUserId = user?._id;

  /* ======================
      LIKE STATE
  ====================== */
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const userId = currentUserId?.toString();
    const isLiked = post.likes?.some(
      (id) => id?.toString() === userId
    );
    setLiked(!!isLiked);
    setLikeCount(post.likes?.length || 0);
  }, [post.likes, currentUserId]);

  /* ======================
      COMMENT COUNT
  ====================== */
  const [commentCount, setCommentCount] = useState(
    displayPost.comments?.length || 0 // 🔥 SỬA: Lấy số comment của bài hiển thị (bài gốc)
  );

  /* ======================
      COMMENT MODAL
  ====================== */
  const [openComment, setOpenComment] = useState(false);

  /* ======================
      SHARE MODAL STATE
  ====================== */
  const [showShareModal, setShowShareModal] = useState(false);

  /* ======================
      DROPDOWN DELETE
  ====================== */
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ======================
      DELETE POST (ANIMATION)
  ====================== */
  const [removing, setRemoving] = useState(false);

  const handleDeletePost = async () => {
    if (!window.confirm("Xóa bài viết này?")) return;

    setRemoving(true);

    try {
      await axiosClient.delete(`/posts/${post._id}`);
      setTimeout(() => {
        // Kiểm tra an toàn trước khi gọi
        if (typeof onDeleted === "function") {
            onDeleted(post._id);
        }
      }, 300);
    } catch (err) {
      console.error("DELETE POST ERROR:", err);
      alert("Không thể xóa bài viết");
      setRemoving(false);
    }
  };

  /* ======================
      MEDIA VIEWER
  ====================== */
  // 3. SỬA: Lọc bỏ media lỗi để tránh crash
  const mediaList = (displayPost.media || []).filter(item => item && item.url);
  
  const activeMedia =
    activeIndex !== null ? mediaList[activeIndex] : null;

  const closeViewer = () => setActiveIndex(null);

  const prevMedia = (e) => {
    e.stopPropagation();
    setActiveIndex((i) => (i > 0 ? i - 1 : i));
  };

  const nextMedia = (e) => {
    e.stopPropagation();
    setActiveIndex((i) =>
      i < mediaList.length - 1 ? i + 1 : i
    );
  };

  /* ======================
      TOGGLE LIKE
  ====================== */
  const handleLike = async () => {
    try {
      setLiked((prev) => !prev);
      setLikeCount((c) => (liked ? c - 1 : c + 1));
      await axiosClient.post(`/posts/${post._id}/like`);
    } catch (err) {
      setLiked((prev) => !prev);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
    }
  };

  /* ======================
      REPOST LOGIC
  ====================== */
  const handleRepost = async () => {
    if (!window.confirm("Bạn muốn đăng lại bài viết này lên trang cá nhân?")) return;
    try {
        // Gọi API repost (Route này phải khớp với backend bạn vừa thêm)
        await axiosClient.post(`/users/repost/${post._id}`);
        alert("Đã đăng lại thành công!");
    } catch (error) {
        console.error("Repost error:", error);
        alert("Lỗi khi đăng lại.");
    }
  };


  /* ======================
      SAVE / BOOKMARK LOGIC
  ====================== */
  // Kiểm tra xem bài viết đã được lưu chưa dựa trên mảng savedPosts của user
  const isSaved = user?.savedPosts?.includes(post._id);

  const handleToggleSave = async () => {
      try {
          const res = await userApi.toggleSavePost(post._id);
          // Cập nhật lại thông tin user trong context (bao gồm mảng savedPosts mới)
          updateUser({ savedPosts: res.data.savedPosts });
          // alert(res.data.message); // Có thể bỏ alert nếu muốn trải nghiệm mượt hơn
      } catch (error) {
          console.error("Lỗi lưu bài viết:", error);
      }
  };


  return (
    <>
      <div className={`post-item ${removing ? "post-removing" : ""}`}>
        {/* Cột trái: Avatar */}
        <Link to={`/profile/${displayPost.author?._id}`}>
          <img
            src={displayPost.author?.profilePicture || displayPost.author?.avatar || DEFAULT_AVATAR}
            className="post-avatar"
            alt="avatar"
            onError={(e) => e.target.src = DEFAULT_AVATAR} 
          />
        </Link>

        {/* Cột phải: Nội dung */}
        <div className="post-content">
          
          {/* 🔥 HEADER REPOST: Chỉ hiện nếu đây là bài đăng lại */}
          {isRepost && (
             <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <FiRepeat size={12} /> 
                 <span style={{fontWeight: 600}}>{post.author?.username}</span> đã đăng lại
             </div>
          )}

          <div className="post-header">
            <div className="post-header-left">
              <Link to={`/profile/${displayPost.author?._id}`} className="post-username-link">
                <span className="post-username">
                  {displayPost.author?.username || "Người dùng"}
                </span>
              </Link>
              <span className="post-time">
                · {displayPost.createdAt ? new Date(displayPost.createdAt).toLocaleString() : ""}
              </span>
            </div>

            {/* LOGIC HIỆN NÚT XÓA (GIỮ NGUYÊN TỪ FILE GỐC CỦA BẠN) */}
            {/* Chỉ xóa được bài wrapper (bài repost) nếu là chính chủ */}
            {String(post.author?._id) === String(currentUserId) && (
              <div className="post-menu" ref={menuRef}>
                <button
                  className="post-menu-btn"
                  onClick={(e) => {
                      e.stopPropagation(); // Thêm cái này để tránh click nhầm vào post
                      setOpenMenu((p) => !p)
                  }}
                >
                  <FiMoreHorizontal size={18} />
                </button>

                {openMenu && (
                  <div className="post-menu-dropdown">
                    <button
                      className="post-menu-delete"
                      onClick={handleDeletePost}
                    >
                      <FiTrash2 size={14} />
                      <span>Xóa</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {displayPost.content && (
            <div className="post-text">{displayPost.content}</div>
          )}

          {/* 5. SỬA: DÙNG TRỰC TIẾP item.url CHO CLOUDINARY (BỎ BACKEND_URL) */}
          {(displayPost.media || []).length > 0 && (
            <div
              className={`post-media-scroll ${
                (displayPost.media || []).length === 1 ? "single" : "multiple"
              }`}
            >
              {(displayPost.media || []).map((item, index) => (
                <div
                  className="post-media-item"
                  key={index}
                  onClick={() => setActiveIndex(index)}
                >
                  {item.type && item.type.startsWith("image") ? (
                    <img src={item.url} loading="lazy" />
                  ) : (
                    <video
                      src={item.url}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="post-actions">
            <div className="action-group">
              <button
                className={`like-btn ${liked ? "liked" : ""}`}
                onClick={handleLike} // Lưu ý: Like này đang like bài wrapper (nếu là repost). Nếu muốn like bài gốc phải sửa logic handleLike
              >
                {liked ? <AiFillHeart size={20} /> : <FiHeart size={20} />}
              </button>
              <span
                className={`like-count ${likeCount === 0 ? "hidden" : ""}`}
              >
                {likeCount}
              </span>
            </div>

            <div className="action-group">
              <button
                className="comment-btn"
                onClick={() => setOpenComment(true)}
              >
                <FiMessageCircle size={20} />
              </button>
              <span
                className={`comment-count ${
                  commentCount === 0 ? "hidden" : ""
                }`}
              >
                {commentCount}
              </span>
            </div>

            {/* ICON ĐĂNG LẠI */}
            <div className="action-group">
              <button
                className="repost-btn"
                onClick={handleRepost}
              >
                <FiRepeat size={20} />
              </button>
            </div>

            {/* ICON GỬI */}
            <div className="action-group">
              <button
                className="send-btn"
                onClick={() => setShowShareModal(true)}
              >
                <FiSend size={20} />
              </button>
            </div>

            {/* 🔥 ICON LƯU BÀI VIẾT (Góc phải đối diện tim) */}
            <div className="action-group" style={{ marginLeft: "auto" }}>
                <button 
                    className={`save-btn ${isSaved ? "saved" : ""}`}
                    onClick={handleToggleSave}
                >
                    {isSaved ? <FaBookmark size={20} /> : <FiBookmark size={20} />}
                </button>
            </div>
          </div>
        </div>
      </div>

      {openComment && (
        <CommentModal
          postId={displayPost._id} // 🔥 SỬA: Truyền ID bài gốc để comment lưu vào đúng chỗ
          onClose={() => setOpenComment(false)}
          onCommentAdded={() => setCommentCount((c) => c + 1)}
        />
      )}

      {showShareModal && (
        <ShareModal 
          post={displayPost} // Chia sẻ bài viết đang hiển thị (hoặc bài gốc nếu là repost)
          onClose={() => setShowShareModal(false)} 
        />
      )}

      {activeMedia && (
        <div className="media-viewer" onClick={closeViewer}>
          <button className="viewer-close" onClick={closeViewer}>
            ✕
          </button>

          {activeIndex > 0 && (
            <button className="viewer-nav left" onClick={prevMedia}>
              ‹
            </button>
          )}

          {activeIndex < mediaList.length - 1 && (
            <button className="viewer-nav right" onClick={nextMedia}>
              ›
            </button>
          )}

          <div
            className="media-viewer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="media-slider"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
              }}
            >
              {mediaList.map((item, index) => (
                <div className="media-slide" key={index}>
                  {item.type && item.type.startsWith("image") ? (
                    <img src={item.url} />
                  ) : (
                    <video
                      src={item.url}
                      controls
                      autoPlay
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}