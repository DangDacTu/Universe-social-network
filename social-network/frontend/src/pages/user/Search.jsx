import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userApi from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

const Search = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Xử lý tìm kiếm
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setResults([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await userApi.search(searchTerm);
                const filtered = res.data.filter(u => u._id !== user._id);
                setResults(filtered);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, user]);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#333', fontSize: '20px' }}>
                    ←
                </Link>
                <h2 style={{ margin: 0 }}>Tìm kiếm thành viên</h2>
            </div>

            {/* Ô nhập liệu */}
            <div style={{ marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Nhập tên người dùng..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    style={{
                        width: '100%',
                        padding: '15px 20px',
                        borderRadius: '30px',
                        border: '1px solid #ccc',
                        fontSize: '16px',
                        outline: 'none',
                        backgroundColor: '#f5f5f5'
                    }}
                />
            </div>

            {/* Loading */}
            {isLoading && <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Đang tìm kiếm...</div>}

            {/* Danh sách kết quả */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {results.map((friend) => (
                    <div key={friend._id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '10px', 
                        borderBottom: '1px solid #eee' 
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img 
                                src={friend.profilePicture || "https://via.placeholder.com/150"} 
                                alt="avatar" 
                                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '16px' }}>{friend.username}</h4>
                                {/* Đã ẩn dòng Email đi cho gọn */}
                            </div>
                        </div>
                        
                        <Link to={`/profile/${friend._id}`}>
                            <button style={{ 
                                padding: '6px 15px', 
                                backgroundColor: '#008CBA', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '15px', 
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}>
                                Xem
                            </button>
                        </Link>
                    </div>
                ))}
            </div>

            {!isLoading && searchTerm && results.length === 0 && (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
                    Không tìm thấy người dùng tên "{searchTerm}"
                </div>
            )}
        </div>
    );
};

export default Search;