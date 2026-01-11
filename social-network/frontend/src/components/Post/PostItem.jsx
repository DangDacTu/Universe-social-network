import "./post.css";

const BACKEND_URL = "http://localhost:5000"; // 🔥 backend của bạn

export default function PostItem({ post }) {
  return (
    <div className="post-item">
      <img src="/avatar.png" className="post-avatar" />

      <div className="post-content">
        {/* HEADER */}
        <div className="post-header">
          <span className="post-username">
            {post.author?.username || "Thành đẹp trai"}
          </span>
          <span className="post-time">
            · {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>

        {/* TEXT */}
        {post.content && (
          <div className="post-text">{post.content}</div>
        )}

       {/* IMAGE */}
{post.media && post.mediaType === "image" && (
  <div className="post-media">
    <img
      src={`${BACKEND_URL}${post.media}`}
      alt="post"
    />
  </div>
)}

{/* VIDEO */}
{post.media && post.mediaType === "video" && (
  <div className="post-media">
    <video
      controls
      src={`${BACKEND_URL}${post.media}`}
    />
  </div>
)}

      </div>
    </div>
  );
}
