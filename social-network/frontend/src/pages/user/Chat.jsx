import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { connectSocket, getSocket } from "../../services/socket";
import messageApi from "../../api/messageApi";
import userApi from "../../api/userApi";
import Sidebar from "../../components/layout/Sidebar";
import ChatSidebar from "../../components/ChatSidebar";
import ChatBox from "../../components/ChatBox";
import "./Chat.css";

export default function Chat() {
  const { user } = useAuth();
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user._id);

    // 1. Nhận tin nhắn mới
    socket.on("receive-message", (msg) => {
      if (msg.senderId === user._id) return;
      addMessageToState(msg.senderId, msg);
    });

    // 2. Xử lý tin nhắn bị XÓA (MỚI)
    socket.on("message-deleted", ({ messageId }) => {
      setMessages(prev => {
        const newState = { ...prev };
        // Lặp qua tất cả cuộc hội thoại để tìm và xóa tin nhắn đó
        for (const uid in newState) {
          newState[uid] = newState[uid].filter(m => m._id !== messageId);
        }
        return newState;
      });
    });

    // 3. Xử lý tin nhắn bị SỬA (MỚI)
    socket.on("message-edited", ({ messageId, newContent }) => {
      setMessages(prev => {
        const newState = { ...prev };
        for (const uid in newState) {
          newState[uid] = newState[uid].map(m => 
            m._id === messageId ? { ...m, content: newContent } : m
          );
        }
        return newState;
      });
    });

    socket.on("chat-error", (data) => alert(data.message));
    socket.on("online-users", (users) => setOnlineUsers(users));
    socket.on("user-status", ({ userId, isOnline }) => {
      setOnlineUsers(prev => isOnline ? [...new Set([...prev, userId])] : prev.filter(id => id !== userId));
    });

    return () => {
      socket.off("receive-message");
      socket.off("message-deleted");
      socket.off("message-edited");
      socket.off("chat-error");
      socket.off("online-users");
      socket.off("user-status");
    };
  }, [user]);

  // Load danh sách user
  useEffect(() => {
    const fetchUsers = async () => {
        try {
            const res = await userApi.getChatAvailableUsers();
            setChatUsers(res.data);
            if (res.data.length > 0 && !selectedUser) setSelectedUser(res.data[0]);
        } catch (e) {}
    };
    fetchUsers();
  }, []);

  // Load lịch sử chat
  useEffect(() => {
    if (!selectedUser) return;
    const fetchHistory = async () => {
      try {
        const res = await messageApi.getChatHistory(selectedUser._id);
        setMessages(prev => ({ ...prev, [selectedUser._id]: res.data || res }));
      } catch (err) {
        if (err.response?.status === 403) setMessages(prev => ({ ...prev, [selectedUser._id]: [] }));
      }
    };
    fetchHistory();
  }, [selectedUser]);

  const addMessageToState = (userId, msg) => {
    setMessages(prev => {
      const list = prev[userId] || [];
      if (list.some(m => m._id === msg._id)) return prev;
      return { ...prev, [userId]: [...list, msg] };
    });
  };

  const handleSendMessage = (payload) => {
    if (!selectedUser) return;
    const socket = getSocket();
    
    const tempMsg = {
      ...payload, _id: `temp_${Date.now()}`,
      senderId: user._id, receiverId: selectedUser._id,
      createdAt: new Date().toISOString(), isRead: false
    };
    addMessageToState(selectedUser._id, tempMsg);

    socket.emit("send-message", { receiverId: selectedUser._id, ...payload });
  };

  return (
    <>
      <Sidebar />
      <div className="chatLayout">
        <div className="chatContainer">
          <div className="chatSidebarWrapper">
            <ChatSidebar users={chatUsers} onlineUsers={onlineUsers} selectedUser={selectedUser} onSelectUser={setSelectedUser} />
          </div>
          <div className="chatBoxWrapper">
            <ChatBox 
              messages={selectedUser ? messages[selectedUser._id] || [] : []}
              currentUserId={user._id} selectedUser={selectedUser} onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </>
  );
}