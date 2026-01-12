import "./post.css";

const BACKEND_URL = "http://localhost:5000";
const DEFAULT_AVATAR = "/avatar.jpg";

export default function PostItem({ post }) {
  return (
    <div className="post-item">
      <img
        src={post.author?.avatar || DEFAULT_AVATAR}
        className="post-avatar"
        alt="avatar"
      />

      <div className="post-content">
        {/* HEADER */}
        <div className="post-header">
          <span className="post-username">
            {post.author?.username || "Người dùng"}
          </span>
          <span className="post-time">
            · {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>

        {/* TEXT */}
        {post.content && (
          <div className="post-text">{post.content}</div>
        )}

        {/* 🔥 MULTI MEDIA (THREAD STYLE) */}
        {post.media && post.media.length > 0 && (
          <div
            className={`post-media-scroll ${post.media.length === 1 ? "single" : "multiple"
              }`}
          >
            {post.media.map((item, index) => (
              <div className="post-media-item" key={index}>
                {item.type === "image" ? (
                  <img
                    src={`${BACKEND_URL}${item.url}`}
                    alt={`media-${index}`}
                  />
                ) : (
                  <video
                    controls
                    src={`${BACKEND_URL}${item.url}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
