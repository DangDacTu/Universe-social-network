import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userApi from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';

// 👇 IMPORT ICON
import { FiSearch, FiArrowLeft, FiChevronRight, FiUser } from "react-icons/fi";
import "./Search.css";

const Search = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
        <>
            <Sidebar />
            <main className="search-main-layout">
                <div className="search-container">
                    
                    {/* HEADER */}
                    <div className="search-header">
                        <div className="search-nav">
                            <Link to="/" className="search-back-btn">
                                <FiArrowLeft size={24} />
                            </Link>
                            <h2 className="search-title">Tìm kiếm</h2>
                        </div>

                        <div className="search-input-wrapper">
                            <FiSearch className="search-icon" size={18} />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                className="search-input"
                            />
                        </div>
                    </div>

                    {/* BODY */}
                    <div className="search-scroll">
                        {isLoading && <div className="search-loading">Đang tải...</div>}

                        <div className="search-list">
                            {results.map((friend) => (
                                <Link 
                                    to={`/profile/${friend._id}`} 
                                    key={friend._id} 
                                    className="search-item"
                                >
                                    <div className="search-user-info">
                                        <div className="search-avatar-wrapper">
                                            {friend.profilePicture ? (
                                                <img 
                                                    src={friend.profilePicture} 
                                                    alt="avatar" 
                                                    className="search-avatar"
                                                />
                                            ) : (
                                                <div className="search-avatar-placeholder">
                                                    <FiUser size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="search-username">{friend.username}</h4>
                                            <span className="search-handle">
                                                {friend.bio ? friend.bio.substring(0, 30) + (friend.bio.length > 30 ? "..." : "") : "universe user"}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Mũi tên chỉ sang phải thay cho nút Xem */}
                                    <div className="search-action-icon">
                                        <FiChevronRight size={20} />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {!isLoading && searchTerm && results.length === 0 && (
                            <div className="search-status-text">
                                Không tìm thấy kết quả cho "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
};

export default Search;