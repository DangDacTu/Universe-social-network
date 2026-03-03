import "./post.css";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_AVATAR = "/avatar.jpg";

export default function PostInput({ onOpen }) {
  const { user } = useAuth();
  const avatarUrl = user?.profilePicture || DEFAULT_AVATAR;

  return (
    <div className="post-input">
      <img
        src={avatarUrl}
        alt="avatar"
        className="avatar"
        // Nếu ảnh lỗi (link chết) thì tự quay về mặc định
        onError={(e) => (e.target.src = DEFAULT_AVATAR)}
      />

      <input
        type="text"
        placeholder="Có gì mới?"
        readOnly // Chỉ để click mở modal, không cho gõ trực tiếp
        onClick={onOpen}
      />

      <button onClick={onOpen}>Đăng</button>
    </div>
  );
}