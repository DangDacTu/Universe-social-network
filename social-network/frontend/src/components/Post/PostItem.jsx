export default function PostItem({ post }) {
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
      <div style={{ fontWeight: 600, marginBottom: "4px" }}>
        {post.author?.username || "Người dùng"}
      </div>

      <div style={{ fontSize: "15px", marginBottom: "6px" }}>
        {post.content}
      </div>

      <div style={{ fontSize: "12px", color: "#888" }}>
        {new Date(post.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
