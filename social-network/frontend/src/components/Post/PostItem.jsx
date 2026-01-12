import { useState } from "react";
import "./post.css";
import axiosClient from "../../api/axiosClient";
import { FiHeart } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";

const BACKEND_URL = "http://localhost:5000";
const DEFAULT_AVATAR = "/avatar.jpg";

export default function PostItem({ post }) {
  const [activeIndex, setActiveIndex] = useState(null);

  // ======================
  // LIKE STATE
  // ======================
  const currentUserId = localStorage.getItem("userId"); // hoặc context
  const [liked, setLiked] = useState(
    post.likes?.includes(currentUserId)
  );
  const [likeCount, setLikeCount] = useState(
    post.likes?.length || 0
  );

  // ======================
  // MEDIA VIEWER
  // ======================
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

  // ======================
  // TOGGLE LIKE
  // ======================
  const handleLike = async () => {
    try {
      setLiked(!liked);
      setLikeCount((c) => (liked ? c - 1 : c + 1));

      await axiosClient.post(`/posts/${post._id}/like`);
    } catch (err) {
      // rollback nếu lỗi
      setLiked(liked);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
      console.error("LIKE ERROR:", err);
    }
  };

  return (
    <>
      {/* ================= FEED ================= */}
      <div className="post-item">
        <img
          src={post.author?.avatar || DEFAULT_AVATAR}
          className="post-avatar"
          alt="avatar"
        />

        <div className="post-content">
          <div className="post-header">
            <span className="post-username">
              {post.author?.username || "Người dùng"}
            </span>
            <span className="post-time">
              · {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>

          {post.content && (
            <div className="post-text">{post.content}</div>
          )}

          {/* MEDIA */}
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
                    <video src={`${BACKEND_URL}${item.url}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ================= ACTION BAR ================= */}
          <div className="post-actions">
            <button
              className={`like-btn ${liked ? "liked" : ""}`}
              onClick={handleLike}
            >
              {liked ? (
                <AiFillHeart size={20} />
              ) : (
                <FiHeart size={20} />
              )}
            </button>

            {likeCount > 0 && (
              <span className="like-count">
                {likeCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ================= FULLSCREEN VIEWER ================= */}
      {activeMedia && (
        <div className="media-viewer" onClick={closeViewer}>
          <button className="viewer-close" onClick={closeViewer}>
            ✕
          </button>

          {activeIndex > 0 && (
            <button
              className="viewer-nav left"
              onClick={prevMedia}
            >
              ‹
            </button>
          )}

          {activeIndex < mediaList.length - 1 && (
            <button
              className="viewer-nav right"
              onClick={nextMedia}
            >
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
