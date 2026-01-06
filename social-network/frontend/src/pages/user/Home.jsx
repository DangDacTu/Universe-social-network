import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import userApi from '../../api/userApi'; // Import userApi

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [userList, setUserList] = useState([]); // State lưu danh sách người dùng

    // 1. Load danh sách user khi vào trang
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await userApi.getAllUsers();
                // Lọc bỏ chính mình ra khỏi danh sách (không cần hiện bản thân để follow)
                const otherUsers = res.data.filter(u => u._id !== user._id);
                setUserList(otherUsers);
            } catch (error) {
                console.error("Lỗi lấy danh sách user:", error);
            }
        };
        if (user) {
            fetchUsers();
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: '#4CAF50' }}>Universe</h2>
                <div>
                    <Link to="/me" style={{ marginRight: '15px', textDecoration: 'none', color: 'blue', fontWeight: 'bold' }}>
                        {user?.username} (Tôi)
                    </Link>
                    <button onClick={handleLogout} style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Đăng xuất
                    </button>
                </div>
            </div>

            {/* Danh sách Gợi ý Follow */}
            <div>
                <h3>Gợi ý kết bạn</h3>
                <p style={{ fontSize: '14px', color: 'gray' }}>Nhấn vào tên để xem trang cá nhân và Follow họ.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {userList.map((friend) => (
                        <div key={friend._id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <img 
                                src={friend.profilePicture || "https://via.placeholder.com/150"} 
                                alt="avatar" 
                                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }}
                            />
                            <h4 style={{ margin: '5px 0', fontSize: '16px' }}>{friend.username}</h4>
                            
                            {/* 👇 LINK QUAN TRỌNG: Dẫn sang trang Profile của người đó */}
                            <Link to={`/profile/${friend._id}`}>
                                <button style={{ 
                                    marginTop: '5px', 
                                    padding: '5px 15px', 
                                    backgroundColor: '#008CBA', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '5px', 
                                    cursor: 'pointer',
                                    width: '100%'
                                }}>
                                    Xem Profile
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
                
                {userList.length === 0 && <p>Chưa có người dùng nào khác.</p>}
            </div>
        </div>
    );
};

export default Home;