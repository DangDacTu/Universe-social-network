import "./post.css";
const DEFAULT_AVATAR = "/avatar.jpg";

export default function PostInput({ onOpen }) {
  return (
    <div className="post-input">
      <img
        src={DEFAULT_AVATAR}
        alt="avatar"
        className="avatar"
      />

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
