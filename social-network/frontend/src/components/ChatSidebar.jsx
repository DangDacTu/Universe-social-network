/**
 * @file ChatSidebar.jsx
 * @description
 * Sidebar chat giống Instagram
 */

import { useState } from "react";
import "./ChatSidebar.css";

export default function ChatSidebar({
    users,
    onlineUsers,
    unreadMap = {},
    selectedUser,
    onSelectUser,
}) {
    const [search, setSearch] = useState("");

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="sidebar">
            <h3 className="title">Tin nhắn</h3>

            {/* 🔍 SEARCH INPUT */}
            <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search"
            />

            {filteredUsers.map((user) => {
                const isOnline = onlineUsers.includes(user._id);
                const unread = unreadMap[user._id] || 0;
                const isSelected = selectedUser?._id === user._id;

                return (
                    <div
                        key={user._id}
                        onClick={() => onSelectUser(user)}
                        className={`userItem ${isSelected ? "selected" : ""}`}
                    >
                        <div className="avatarWrapper">
                            <img
                                src={
                                    user.profilePicture ||
                                    "https://via.placeholder.com/40"
                                }
                                alt=""
                                className="avatar"
                            />

                            {/* 🟢 ONLINE DOT */}
                            {isOnline && <span className="onlineDot" />}
                        </div>

                        <span className="username">{user.username}</span>

                        {/* 🔴 UNREAD BADGE */}
                        {unread > 0 && (
                            <span className="unreadBadge">{unread}</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
