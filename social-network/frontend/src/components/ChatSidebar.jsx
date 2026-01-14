/**
 * @file ChatSidebar.jsx
 * @description
 * Sidebar chat giống Instagram
 */

import { useState } from "react";

export default function ChatSidebar({
    users,
    onlineUsers,
    unreadMap = {}, // 🔴 unread badge
    selectedUser,
    onSelectUser,
}) {
    // 🔍 search state
    const [search, setSearch] = useState("");

    // 🔍 filter users theo username
    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={styles.sidebar}>
            <h3 style={styles.title}>Inbox</h3>

            {/* 🔍 SEARCH INPUT */}
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.search}
            />

            {filteredUsers.map((user) => {
                const isOnline = onlineUsers.includes(user._id);
                const unread = unreadMap[user._id] || 0;

                return (
                    <div
                        key={user._id}
                        onClick={() => onSelectUser(user)}
                        style={{
                            ...styles.userItem,
                            backgroundColor:
                                selectedUser?._id === user._id
                                    ? "#eee"
                                    : "transparent",
                        }}
                    >
                        <div style={styles.avatarWrapper}>
                            <img
                                src={
                                    user.profilePicture ||
                                    "https://via.placeholder.com/40"
                                }
                                alt=""
                                style={styles.avatar}
                            />

                            {/* 🟢 ONLINE DOT */}
                            {isOnline && <span style={styles.onlineDot} />}
                        </div>

                        {/* USERNAME */}
                        <span style={{ flex: 1 }}>{user.username}</span>

                        {/* 🔴 UNREAD BADGE */}
                        {unread > 0 && (
                            <span style={styles.unreadBadge}>
                                {unread}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

const styles = {
    sidebar: {
        width: "280px",
        borderRight: "1px solid #ddd",
        padding: "10px",
    },
    title: {
        marginBottom: "10px",
    },
    search: {
        width: "94%",
        padding: "8px",
        marginBottom: "10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        outline: "none",
    },
    userItem: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px",
        cursor: "pointer",
        borderRadius: "6px",
    },
    avatarWrapper: {
        position: "relative",
    },
    avatar: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        objectFit: "cover",
    },
    onlineDot: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: "10px",
        height: "10px",
        backgroundColor: "#00d100",
        borderRadius: "50%",
        border: "2px solid white",
    },
    unreadBadge: {
        minWidth: "20px",
        height: "20px",
        backgroundColor: "red",
        color: "white",
        fontSize: "12px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 6px",
    },
};
