import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import "./Search.css"; // Import file CSS mới
import { FiArrowLeft, FiSearch, FiX, FiChevronRight, FiUser } from "react-icons/fi";

const Search = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Xử lý tìm kiếm
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setResults([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await userApi.search(searchTerm);
                const filtered = res.data.filter((u) => u._id !== user._id);
                setResults(filtered);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, user]);

    const handleClear = () => {
        setSearchTerm("");
        setResults([]);
    };

    return (
        <div className="search-wrapper-center">
            {/* Khung Search giống khung Feed */}
            <div className="search-container">
                
                {/* Header cố định */}
                <div className="search-header">
                    <div className="search-nav">
                        <button className="search-back-btn" onClick={() => navigate(-1)}>
                            <FiArrowLeft size={24} />
                        </button>
                        <h2 className="search-title">Tìm kiếm</h2>
                    </div>

                    <div className="search-input-wrapper">
                        <FiSearch className="search-icon" size={20} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Tìm kiếm mọi người..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                        {searchTerm && (
                            <button className="search-clear-btn" onClick={handleClear}>
                                <FiX size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Danh sách kết quả (Scrollable) */}
                <div className="search-scroll">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="search-status-text">
                            <div className="spinner"></div>
                            <p>Đang tìm kiếm...</p>
                        </div>
                    )}

                    {/* Empty State khi mới vào */}
                    {!isLoading && !searchTerm && (
                        <div className="search-empty-state">
                            <div className="empty-icon-circle">
                                <FiSearch size={40} />
                            </div>
                            <h3>Tìm kiếm bạn bè</h3>
                            <p>Nhập tên để tìm kiếm người dùng.</p>
                        </div>
                    )}

                    {/* No Results */}
                    {!isLoading && searchTerm && results.length === 0 && (
                        <div className="search-status-text">
                            Không tìm thấy kết quả cho "<b>{searchTerm}</b>"
                        </div>
                    )}

                    {/* Results List */}
                    {results.map((friend) => (
                        <Link 
                            to={`/profile/${friend._id}`} 
                            key={friend._id} 
                            className="search-item"
                        >
                            <div className="search-user-info">
                                {friend.profilePicture ? (
                                    <img
                                        src={friend.profilePicture}
                                        alt={friend.username}
                                        className="search-avatar"
                                    />
                                ) : (
                                    <div className="search-avatar-placeholder">
                                        <FiUser size={20} />
                                    </div>
                                )}
                                <div>
                                    <h4 className="search-username">{friend.username}</h4>
                                    <span className="search-handle">@{friend.username} • Universe</span>
                                </div>
                            </div>
                            
                            <div className="search-action-icon">
                                <FiChevronRight size={20} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Search;