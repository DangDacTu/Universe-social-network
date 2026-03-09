import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import { connectSocket, getSocket } from "../../services/socket";
import messageApi from "../../api/messageApi";
import userApi from "../../api/userApi";
import Sidebar from "../../components/layout/Sidebar";
import ChatSidebar from "../../components/ChatSidebar";
import ChatBox from "../../components/ChatBox";
import "./Chat.css";

export default function Chat() {
  const { user } = useAuth();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState("inbox");
  const [inboxUsers, setInboxUsers] = useState([]);
  const [requestUsers, setRequestUsers] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user._id);

    socket.on("receive-message", (msg) => {
      if (msg.senderId === user._id) return;
      addMessageToState(msg.senderId, msg);
    });

    socket.on("message-deleted", ({ messageId }) => {
      setMessages(prev => {
        const newState = { ...prev };
        for (const uid in newState) {
          newState[uid] = newState[uid].filter(m => m._id !== messageId);
        }
        return newState;
      });
    });

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

  useEffect(() => {
    const fetchUsers = async () => {
        try {
            const res = await userApi.getChatAvailableUsers();
            const { inbox, requests } = res.data;
            
            setInboxUsers(inbox);
            setRequestUsers(requests);
            
            setChatUsers(inbox);

            const targetUserId = location.state?.userId;
            const allUsers = [...inbox, ...requests];
            const targetUser = allUsers.find(u => u._id === targetUserId);

            if (targetUser) {
                setSelectedUser(targetUser);
                if (requests.find(u => u._id === targetUserId)) {
                    setActiveTab("requests");
                    setChatUsers(requests);
                }
            } else if (inbox.length > 0 && !selectedUser) {
                setSelectedUser(inbox[0]);
            }
        } catch (e) {}
    };
    fetchUsers();
  }, []);

  const handleTabChange = (tab) => {
      setActiveTab(tab);
      if (tab === "inbox") setChatUsers(inboxUsers);
      else setChatUsers(requestUsers);
      setSelectedUser(null);
  };

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
            <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
                <button 
                    onClick={() => handleTabChange("inbox")}
                    style={{
                        flex: 1, padding: '10px', border: 'none', background: 'none', cursor: 'pointer',
                        fontWeight: activeTab === 'inbox' ? 'bold' : 'normal',
                        borderBottom: activeTab === 'inbox' ? '2px solid black' : 'none'
                    }}
                >
                    Hộp thư
                </button>
                <button 
                    onClick={() => handleTabChange("requests")}
                    style={{
                        flex: 1, padding: '10px', border: 'none', background: 'none', cursor: 'pointer',
                        fontWeight: activeTab === 'requests' ? 'bold' : 'normal',
                        borderBottom: activeTab === 'requests' ? '2px solid black' : 'none'
                    }}
                >
                    Tin nhắn chờ {requestUsers.length > 0 && <span style={{color:'red'}}>({requestUsers.length})</span>}
                </button>
            </div>

            <ChatSidebar users={chatUsers} onlineUsers={onlineUsers} selectedUser={selectedUser} onSelectUser={setSelectedUser} />
          </div>
          <div className="chatBoxWrapper">
            <ChatBox 
              messages={selectedUser ? messages[selectedUser._id] || [] : []}
              currentUserId={user._id} selectedUser={selectedUser} onSendMessage={handleSendMessage}
              isOnline={selectedUser ? onlineUsers.includes(selectedUser._id) : false}
            />
          </div>
        </div>
      </div>
    </>
  );
}