import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import userApi from '../../api/userApi';

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [userList, setUserList] = useState([]);

    // Load danh sách gợi ý (bỏ qua bản thân)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await userApi.getAllUsers();
                if (res && res.data) {
                    const otherUsers = res.data.filter(u => u._id !== user._id);
                    setUserList(otherUsers);
                }
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
                <h2 style={{ color: '#4CAF50', margin: 0 }}>Universe</h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* --- NÚT TÌM KIẾM --- */}
                    <Link to="/search" style={{ textDecoration: 'none' }}>
                        <button style={{ 
                            padding: '10px 15px', 
                            backgroundColor: '#f0f2f5', 
                            border: 'none', 
                            borderRadius: '20px', 
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            color: '#65676b', fontWeight: 'bold'
                        }}>
                            🔍 Tìm kiếm
                        </button>
                    </Link>

                    <Link to="/me" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
                        {user?.username}
                    </Link>
                    
                    <button onClick={handleLogout} style={{ padding: '8px 12px', backgroundColor: '#e4e6eb', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Đăng xuất
                    </button>
                </div>
            </div>

            {/* Nội dung chính: Gợi ý kết bạn */}
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Gợi ý kết bạn</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {userList.map((friend) => (
                    <div key={friend._id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', textAlign: 'center', background: '#fff' }}>
                        <img 
                            src={friend.profilePicture || "https://via.placeholder.com/150"} 
                            alt="avatar" 
                            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }}
                        />
                        <h4 style={{ margin: '5px 0', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {friend.username}
                        </h4>
                        
                        <Link to={`/profile/${friend._id}`}>
                            <button style={{ marginTop: '5px', padding: '5px 15px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>
                                Xem Profile
                            </button>
                        </Link>
                    </div>
                ))}
            </div>
            
            {userList.length === 0 && <p style={{textAlign: 'center', color: '#888', marginTop: '30px'}}>Chưa có gợi ý nào.</p>}
        </div>
    );
};

export default Home;