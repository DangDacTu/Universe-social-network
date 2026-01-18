import "./post.css";
import { useEffect, useState } from "react";

const DEFAULT_AVATAR = "/avatar.jpg";

export default function PostInput({ onOpen }) {
  // --- 1. LẤY THÔNG TIN USER TỪ LOCALSTORAGE ---
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        // Ưu tiên profilePicture (mới), nếu không có thì avatar (cũ), cuối cùng là default
        const url = user.profilePicture || user.avatar || DEFAULT_AVATAR;
        setAvatarUrl(url);
      }
    } catch (error) {
      console.error("Lỗi đọc user avatar:", error);
    }
  }, []);

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