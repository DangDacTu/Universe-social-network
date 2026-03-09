import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userApi from '../../api/userApi';
import axiosClient from '../../api/axiosClient';
import EditProfileModal from '../../components/EditProfileModal';
import PostItem from '../../components/Post/PostItem.jsx';
import './Profile.css';

import { 
    FiArrowLeft, 
    FiEdit2, 
    FiUserPlus, 
    FiUserCheck, 
    FiShare2, 
    FiMessageSquare,
    FiX,
    FiRepeat
} from "react-icons/fi";

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, updateUser } = useAuth();
    
    const [profile, setProfile] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [followed, setFollowed] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [activeTab, setActiveTab] = useState('posts');

    const [showFollowModal, setShowFollowModal] = useState(false);
    const [followList, setFollowList] = useState([]);
    const [modalTitle, setModalTitle] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setProfile(null);
                setUserPosts([]);
                
                const userId = id || currentUser?._id;
                if (!userId) return;

                const { data: userData } = await userApi.getUser(userId);
                setProfile(userData);

                if (currentUser && userData.followers.includes(currentUser._id)) {
                    setFollowed(true);
                } else {
                    setFollowed(false);
                }

                setLoadingPosts(true);
                try {
                    let url = `/posts/user/${userId}`;
                    if (activeTab === 'reposts') {
                        url = `/users/${userId}/reposts`;
                    }

                    const { data: postsData } = await axiosClient.get(url);
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
    }, [id, currentUser?._id, activeTab]);

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
        if (updateUser) {
            updateUser(updatedData);
        }
    };

    const handleMessage = () => {
        navigate('/chat', { state: { userId: profile._id } });
    };

    const handleShowFollowers = async () => {
        if (!profile) return;
        try {
            const res = await axiosClient.get(`/users/${profile._id}/followers`);
            setFollowList(res.data);
            setModalTitle("Người theo dõi");
            setShowFollowModal(true);
        } catch (error) {
            console.error("Lỗi lấy danh sách followers:", error);
        }
    };

    const handleShowFollowing = async () => {
        if (!profile) return;
        try {
            const res = await axiosClient.get(`/users/${profile._id}/following`);
            setFollowList(res.data);
            setModalTitle("Đang theo dõi");
            setShowFollowModal(true);
        } catch (error) {
            console.error("Lỗi lấy danh sách following:", error);
        }
    };

    const isMyProfile = currentUser && profile && currentUser._id === profile._id;

    return (
        <>
            <style>{`
                .follow-modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); z-index: 9999;
                    display: flex; align-items: center; justify-content: center;
                }
                .follow-modal {
                    background: white; width: 400px; max-height: 80vh;
                    border-radius: 16px; display: flex; flex-direction: column;
                    overflow: hidden; color: #000;
                }
                .follow-modal-header {
                    padding: 16px; border-bottom: 1px solid #000000;
                    display: flex; justify-content: space-between; align-items: center; font-weight: bold;
                }
                .follow-list { overflow-y: auto; padding: 0; margin: 0; list-style: none; }
                .follow-item {
                    display: flex; align-items: center; padding: 12px 16px;
                    text-decoration: none; color: #000; transition: background 0.2s;
                }
                .follow-item:hover { background: #f5f5f5; }
                .follow-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 12px; }
                .follow-name { font-weight: 600; font-size: 15px; }
            `}</style>

            <main className="profile-main-layout">
                <div className="profile-content-box">
                    <div className="profile-scroll">
                        {!profile ? (
                            <div className="loading-state">Đang tải hồ sơ...</div>
                        ) : (
                            <div className="profile-container">
                                
                                <div className="profile-nav-header">
                                    <Link to="/" className="profile-back-btn">
                                        <FiArrowLeft size={24} />
                                    </Link>
                                    <span className="nav-title">{profile.username}</span>
                                </div>

                                <div className="profile-header">
                                    <div className="profile-info">
                                        <h2 className="profile-username">{profile.username}</h2>
                                        <div className="profile-handle-wrapper">
                                        </div>
                                        
                                        <div className="profile-bio">
                                            {profile.bio || "Chưa có giới thiệu."}
                                        </div>

                                        <div className="profile-stats">
                                             <span 
                                                onClick={handleShowFollowers} 
                                                style={{ cursor: "pointer" }}
                                                title="Xem người theo dõi"
                                             >
                                                <b>{profile.followers.length}</b> người theo dõi
                                             </span>
                                             <span 
                                                onClick={handleShowFollowing} 
                                                style={{ cursor: "pointer" }}
                                                title="Xem đang theo dõi"
                                             >
                                                <b>{profile.following.length}</b> đang theo dõi
                                             </span>
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

                                <div className="profile-actions">
                                    {isMyProfile ? (
                                        <button 
                                            className="action-btn secondary"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <FiEdit2 size={16} /> 
                                            <span>Chỉnh sửa</span>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleFollow} 
                                            className={`action-btn ${followed ? 'secondary' : 'primary'}`}
                                        >
                                            {followed ? <FiUserCheck size={18} /> : <FiUserPlus size={18} />}
                                            <span>{followed ? "Đang theo dõi" : "Theo dõi"}</span>
                                        </button>
                                    )}

                                    {!isMyProfile && followed && (
                                        <button 
                                            className="action-btn secondary"
                                            onClick={handleMessage}
                                        >
                                            <FiMessageSquare size={16} />
                                            <span>Nhắn tin</span>
                                        </button>
                                    )}

                                    <button 
                                        className="action-btn secondary"
                                        onClick={() => alert("Chức năng này đang phát triển")}
                                    >
                                        <FiShare2 size={16} />
                                        <span>Chia sẻ</span>
                                    </button>
                                </div>

                                <div className="profile-tabs">
                                    <div 
                                        className={`tab-item ${activeTab === 'posts' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('posts')}
                                    >
                                        Bài Đăng
                                    </div>
                                    <div 
                                        className={`tab-item ${activeTab === 'reposts' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('reposts')}
                                    >
                                        Đăng lại
                                    </div>
                                </div>

                                <div className="profile-posts-list">
                                    {loadingPosts ? (
                                        <div style={{textAlign: 'center', padding: '20px', color: '#888'}}>Đang tải bài viết...</div>
                                    ) : userPosts.length > 0 ? (
                                        userPosts.map((post) => (
                                            <div key={post._id} style={{ borderBottom: "1px solid #cccccc" }}>
                                                <PostItem post={post} onDeleted={handlePostDeleted} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="profile-posts empty">
                                            <div className="empty-icon-circle">
                                                <FiMessageSquare size={24} />
                                            </div>
                                            <p>{activeTab === 'posts' ? "Chưa có bài viết nào." : "Chưa có bài đăng lại nào."}</p>
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

                                {showFollowModal && (
                                    <div className="follow-modal-overlay" onClick={() => setShowFollowModal(false)}>
                                        <div className="follow-modal" onClick={e => e.stopPropagation()}>
                                            <div className="follow-modal-header">
                                                <span>{modalTitle}</span>
                                                <button onClick={() => setShowFollowModal(false)} style={{background:'none', border:'none', cursor:'pointer'}}>
                                                    <FiX size={24} />
                                                </button>
                                            </div>
                                            <div className="follow-list">
                                                {followList.length === 0 ? (
                                                    <div style={{padding: 20, textAlign: 'center', color: '#888'}}>Trống</div>
                                                ) : (
                                                    followList.map(user => (
                                                        <Link 
                                                            to={`/profile/${user._id}`} 
                                                            key={user._id} 
                                                            className="follow-item"
                                                            onClick={() => setShowFollowModal(false)}
                                                        >
                                                            <img src={user.profilePicture || "https://via.placeholder.com/150"} className="follow-avatar" alt="" />
                                                            <span className="follow-name">{user.username}</span>
                                                        </Link>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
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