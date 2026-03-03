import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userApi from '../../api/userApi';
import axiosClient from '../../api/axiosClient';
import EditProfileModal from '../../components/EditProfileModal';
import Sidebar from '../../components/layout/Sidebar';
import PostItem from '../../components/post/PostItem'; // Import PostItem
import './Profile.css';

import { 
    FiArrowLeft, 
    FiEdit2, 
    FiUserPlus, 
    FiUserCheck, 
    FiShare2, 
    FiMessageSquare 
} from "react-icons/fi";

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser, updateUser } = useAuth();
    
    const [profile, setProfile] = useState(null);
    const [userPosts, setUserPosts] = useState([]); // State lưu bài viết
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [followed, setFollowed] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setProfile(null);
                setUserPosts([]);
                
                const userId = id || currentUser?._id;
                if (!userId) return;

                // 1. Lấy thông tin Profile
                const { data: userData } = await userApi.getUser(userId);
                setProfile(userData);

                if (currentUser && userData.followers.includes(currentUser._id)) {
                    setFollowed(true);
                } else {
                    setFollowed(false);
                }

                // 2. Lấy danh sách bài viết của User
                setLoadingPosts(true);
                try {
                    const { data: postsData } = await axiosClient.get(`/posts/user/${userId}`);
                    setUserPosts(postsData);
                } catch (postError) {
                    console.error("Lỗi lấy bài viết:", postError);
                } finally {
                    setLoadingPosts(false);
                }

            } catch (error) {
                console.error("Failed to fetch profile data", error);
            }
        };

        fetchData();
    }, [id, currentUser?._id]); // ✅ THAY ĐỔI: Chỉ phụ thuộc vào ID để tránh re-fetch không cần thiết

    // Xử lý khi xóa bài viết (Cập nhật giao diện ngay lập tức)
    const handlePostDeleted = (deletedPostId) => {
        setUserPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
    };

    const handleFollow = async () => {
        if (!currentUser) return alert("Vui lòng đăng nhập!");
        if (currentUser._id === profile._id) return;

        try {
            if (followed) {
                await userApi.unfollow(profile._id);
                setFollowed(false);
                setProfile(prev => ({
                    ...prev, 
                    followers: prev.followers.filter(uid => uid !== currentUser._id)
                })); 
            } else {
                await userApi.follow(profile._id);
                setFollowed(true);
                setProfile(prev => ({
                    ...prev, 
                    followers: [...prev.followers, currentUser._id]
                }));
            }
        } catch (error) {
            console.error("Follow error", error);
        }
    };

    const handleUpdateSuccess = (updatedData) => {
        setProfile(prev => ({ ...prev, ...updatedData }));
        // Cập nhật thông tin user trên toàn cục
        if (updateUser) {
            updateUser(updatedData);
        }
    };

    const isMyProfile = currentUser && profile && currentUser._id === profile._id;

    return (
        <>
            <Sidebar />
            <main className="profile-main-layout">
                <div className="profile-content-box">
                    <div className="profile-scroll">
                        {!profile ? (
                            <div className="loading-state">Loading profile...</div>
                        ) : (
                            <div className="profile-container">
                                
                                {/* HEADER NAV */}
                                <div className="profile-nav-header">
                                    <Link to="/" className="profile-back-btn">
                                        <FiArrowLeft size={24} />
                                    </Link>
                                    <span className="nav-title">{profile.username}</span>
                                </div>

                                {/* THÔNG TIN PROFILE */}
                                <div className="profile-header">
                                    <div className="profile-info">
                                        <h2 className="profile-username">{profile.username}</h2>
                                        <div className="profile-handle-wrapper">
                                            <span className="profile-handle">universe.net</span>
                                        </div>
                                        
                                        <div className="profile-bio">
                                            {profile.bio || "Chưa có giới thiệu."}
                                        </div>

                                        <div className="profile-stats">
                                             <span><b>{profile.followers.length}</b> người theo dõi</span>
                                             <span><b>{profile.following.length}</b> đang theo dõi</span>
                                        </div>
                                    </div>

                                    <div className="profile-avatar-container">
                                        <img 
                                            src={profile.profilePicture || "https://via.placeholder.com/150"} 
                                            alt="Avatar" 
                                            className="profile-avatar"
                                        />
                                    </div>
                                </div>

                                {/* NÚT HÀNH ĐỘNG */}
                                <div className="profile-actions">
                                    {isMyProfile ? (
                                        <button 
                                            className="action-btn secondary"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <FiEdit2 size={16} /> 
                                            <span>Edit Profile</span>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleFollow} 
                                            className={`action-btn ${followed ? 'secondary' : 'primary'}`}
                                        >
                                            {followed ? <FiUserCheck size={18} /> : <FiUserPlus size={18} />}
                                            <span>{followed ? "Following" : "Follow"}</span>
                                        </button>
                                    )}

                                    <button 
                                        className="action-btn secondary"
                                        onClick={() => alert("Chức năng này đang phát triển")}
                                    >
                                        <FiShare2 size={16} />
                                        <span>Share</span>
                                    </button>
                                </div>

                                {/* TABS */}
                                <div className="profile-tabs">
                                    <div className="tab-item active">Threads</div>
                                </div>

                                {/* DANH SÁCH BÀI VIẾT */}
                                <div className="profile-posts-list">
                                    {loadingPosts ? (
                                        <div style={{textAlign: 'center', padding: '20px', color: '#888'}}>Đang tải bài viết...</div>
                                    ) : userPosts.length > 0 ? (
                                        userPosts.map((post) => (
                                            <div key={post._id} style={{ borderBottom: '1px solid #eee' }}>
                                                {/* Hiển thị bài viết */}
                                                <PostItem post={post} onDeleted={handlePostDeleted} />
                                            </div>
                                        ))
                                    ) : (
                                        // EMPTY STATE KHI KHÔNG CÓ BÀI
                                        <div className="profile-posts empty">
                                            <div className="empty-icon-circle">
                                                <FiMessageSquare size={24} />
                                            </div>
                                            <p>Chưa có bài viết nào.</p>
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <EditProfileModal 
                                        user={profile}
                                        onClose={() => setIsEditing(false)}
                                        onUpdateSuccess={handleUpdateSuccess}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
};

export default Profile;