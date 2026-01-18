import { useState, useEffect, useRef } from "react";
import "./post.css";
import axiosClient from "../../api/axiosClient";
import { FiHeart, FiMessageCircle, FiMoreHorizontal } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import CommentModal from "../CommentModal/CommentModal";
import { FiTrash2 } from "react-icons/fi";

const BACKEND_URL = "http://localhost:5000";
const DEFAULT_AVATAR = "/avatar.jpg";

export default function PostItem({ post, onDeleted }) {
  const [activeIndex, setActiveIndex] = useState(null);

  /* ======================
     CURRENT USER
  ====================== */
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserId = user?._id || null;

  /* ======================
     LIKE STATE
  ====================== */
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const userId = currentUserId?.toString();
    const isLiked = post.likes?.some(
      (id) => id.toString() === userId
    );
    setLiked(isLiked);
    setLikeCount(post.likes?.length || 0);
  }, [post.likes, currentUserId]);

  /* ======================
     COMMENT COUNT
  ====================== */
  const [commentCount, setCommentCount] = useState(
    post.comments?.length || 0
  );

  /* ======================
     COMMENT MODAL
  ====================== */
  const [openComment, setOpenComment] = useState(false);

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
        onDeleted(post._id);
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
  const mediaList = post.media || [];
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

  return (
    <>
      <div className={`post-item ${removing ? "post-removing" : ""}`}>
        <img
          src={post.author?.avatar || DEFAULT_AVATAR}
          className="post-avatar"
          alt="avatar"
        />

        <div className="post-content">
          <div className="post-header">
            <div className="post-header-left">
              <span className="post-username">
                {post.author?.username || "Người dùng"}
              </span>
              <span className="post-time">
                · {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>

            {String(post.author?._id) === String(currentUserId) && (
              <div className="post-menu" ref={menuRef}>
                <button
                  className="post-menu-btn"
                  onClick={() => setOpenMenu((p) => !p)}
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

          {post.content && (
            <div className="post-text">{post.content}</div>
          )}

          {mediaList.length > 0 && (
            <div
              className={`post-media-scroll ${
                mediaList.length === 1 ? "single" : "multiple"
              }`}
            >
              {mediaList.map((item, index) => (
                <div
                  className="post-media-item"
                  key={index}
                  onClick={() => setActiveIndex(index)}
                >
                  {item.type === "image" ? (
                    <img src={`${BACKEND_URL}${item.url}`} />
                  ) : (
                    /* ✅ AUTOPLAY + MUTED (THREADS STYLE) */
                    <video
                      src={`${BACKEND_URL}${item.url}`}
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
                onClick={handleLike}
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
          </div>
        </div>
      </div>

      {openComment && (
        <CommentModal
          postId={post._id}
          onClose={() => setOpenComment(false)}
          onCommentAdded={() => setCommentCount((c) => c + 1)}
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
                  {item.type === "image" ? (
                    <img src={`${BACKEND_URL}${item.url}`} />
                  ) : (
                    <video
                      src={`${BACKEND_URL}${item.url}`}
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
