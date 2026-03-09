import { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import userApi from '../../api/userApi';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import './ShareModal.css';

const ShareModal = ({ post, onClose }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Lấy danh sách người có thể chat (Inbox + Requests)
                const res = await userApi.getChatAvailableUsers();
                const { inbox, requests } = res.data;
                
                // Gộp chung lại để hiển thị, loại bỏ trùng lặp nếu có
                const allUsers = [...inbox, ...requests];
                // Lọc unique theo _id
                const uniqueUsers = Array.from(new Map(allUsers.map(item => [item._id, item])).values());
                
                setUsers(uniqueUsers);
            } catch (error) {
                console.error("Lỗi lấy danh sách bạn bè:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleToggleUser = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleSend = () => {
        if (selectedUsers.length === 0) return;
        setSending(true);

        const socket = getSocket();
        // Tạo link bài viết (giả sử route là /post/:id hoặc modal post detail)
        // Nếu bạn dùng modal để xem post, link có thể là trang chủ hoặc profile
        const postLink = `${window.location.origin}/post/${post._id}`;
        
        // Gửi tin nhắn cho từng người được chọn
        selectedUsers.forEach(receiverId => {
            // Emit sự kiện giống như trong ChatBox
            socket.emit("send-message", {
                senderId: currentUser._id,
                receiverId: receiverId,
                content: postLink,
                mediaType: 'text' // Gửi dưới dạng text link
            });
        });

        setTimeout(() => {
            setSending(false);
            alert("Đã gửi thành công!");
            onClose();
        }, 500);
    };

    // Filter users theo search term
    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="share-modal-overlay" onClick={onClose}>
            <div className="share-modal-container" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="share-modal-header">
                    <div style={{width: 24}}></div> {/* Spacer */}
                    <span className="share-modal-title">Chia sẻ</span>
                    <button className="share-close-btn" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                {/* Search */}
                <div className="share-search-wrapper">
                    <span className="share-search-label">Tới:</span>
                    <input 
                        type="text" 
                        className="share-search-input" 
                        placeholder="Tìm kiếm..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* List */}
                <div className="share-user-list">
                    {loading ? (
                        <div style={{padding: 20, textAlign: 'center', color: '#888'}}>Đang tải...</div>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <div 
                                key={user._id} 
                                className="share-user-item" 
                                onClick={() => handleToggleUser(user._id)}
                            >
                                <img 
                                    src={user.profilePicture || "/avatar.jpg"} 
                                    alt={user.username} 
                                    className="share-avatar" 
                                />
                                <div className="share-user-info">
                                    <span className="share-username">{user.username}</span>
                                    <span className="share-fullname">{user.fullname || user.username}</span>
                                </div>
                                <div className={`share-checkbox ${selectedUsers.includes(user._id) ? 'selected' : ''}`}>
                                    {selectedUsers.includes(user._id) && <FiCheck size={16} />}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{padding: 20, textAlign: 'center', color: '#888'}}>Không tìm thấy người dùng.</div>
                    )}
                </div>

                {/* Footer */}
                <div className="share-modal-footer">
                    <button 
                        className="share-send-btn" 
                        disabled={selectedUsers.length === 0 || sending}
                        onClick={handleSend}
                    >
                        {sending ? "Đang gửi..." : "Gửi"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
