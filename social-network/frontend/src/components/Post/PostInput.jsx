import "./post.css";

export default function PostInput({ onOpen }) {
  return (
    <div className="post-input">
      <img src="/avatar.png" className="avatar" />

      <input
        type="text"
        placeholder="Có gì mới?"
        readOnly
        onClick={onOpen}
      />

      <button onClick={onOpen}>Đăng</button>
    </div>
  );
}
