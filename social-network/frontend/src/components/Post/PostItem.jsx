import { useState } from "react";
import "./post.css";

const BACKEND_URL = "http://localhost:5000";
const DEFAULT_AVATAR = "/avatar.jpg";

export default function PostItem({ post }) {
  const [activeIndex, setActiveIndex] = useState(null);

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

  return (
    <>
      {/* ================= FEED (KHÔNG ĐỔI) ================= */}
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
        </div>
      </div>

      {/* ================= FULLSCREEN VIEWER ================= */}
      {activeMedia && (
        <div className="media-viewer" onClick={closeViewer}>
          {/* ❌ FIXED TOP LEFT */}
          <button className="viewer-close" onClick={closeViewer}>
            ✕
          </button>

          {/* ◀ FIXED LEFT */}
          {activeIndex > 0 && (
            <button
              className="viewer-nav left"
              onClick={prevMedia}
            >
              ‹
            </button>
          )}

          {/* ▶ FIXED RIGHT */}
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
