import { useState } from "react";
import "./ChatSidebar.css";
import { FiEdit } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";

export default function ChatSidebar({ users, onlineUsers, selectedUser, onSelectUser }) {
  // State cho thanh tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // Lọc danh sách user theo tên
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ig-sidebar">
      {/* HEADER: Tên User của mình + Nút soạn tin */}
      <div className="ig-sidebar-header">
        <div className="ig-own-profile">
            <span className="ig-username">dagd.tu</span> {/* Thay bằng user hiện tại */}
            <IoIosArrowDown />
        </div>
        <FiEdit size={24} className="ig-new-chat-icon" />
      </div>

      {/* SEARCH BAR (MỚI) */}
      <div className="ig-search-wrapper">
        <input 
            type="text" 
            placeholder="Search..." 
            className="ig-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* USER LIST (Đã bỏ Requests và Status text) */}
      <div className="ig-user-list">
        {filteredUsers.map((user) => {
           const isOnline = onlineUsers.includes(user._id);
           const isSelected = selectedUser?._id === user._id;

           return (
            <div 
                key={user._id} 
                className={`ig-user-item ${isSelected ? "selected" : ""}`}
                onClick={() => onSelectUser(user)}
            >
              <div className="ig-avatar-wrapper">
                <img src={user.profilePicture || "/avatar.jpg"} alt="" className="ig-avatar" />
                {isOnline && <div className="ig-online-dot"></div>}
              </div>

              <div className="ig-user-info">
                <span className="ig-user-name">{user.username}</span>
                {/* Đã xóa dòng Active status ở đây */}
              </div>
            </div>
           );
        })}

        {/* Thông báo nếu không tìm thấy user */}
        {filteredUsers.length === 0 && (
            <div style={{textAlign: 'center', color: '#8e8e8e', marginTop: 20}}>
                No account found.
            </div>
        )}
      </div>
    </div>
  );
}