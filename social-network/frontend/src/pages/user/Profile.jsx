import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userApi from '../../api/userApi';
import EditProfileModal from '../../components/EditProfileModal';
import './Profile.css';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [followed, setFollowed] = useState(false);
    
    // State bật tắt Modal
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = id || currentUser?._id;
                if (!userId) return;

                const { data } = await userApi.getUser(userId);
                setProfile(data);

                // Kiểm tra xem mình đã follow người này chưa
                if (currentUser && data.followers.includes(currentUser._id)) {
                    setFollowed(true);
                } else {
                    setFollowed(false);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };
        fetchProfile();
    }, [id, currentUser]);

    // 👇👇👇 LOGIC FOLLOW/UNFOLLOW ĐÃ ĐƯỢC SỬA 👇👇👇
    const handleFollow = async () => {
        if (!currentUser) {
            alert("Vui lòng đăng nhập để thực hiện chức năng này!");
            return;
        }

        // Chặn follow chính mình (dù nút đã ẩn nhưng thêm cho chắc)
        if (currentUser._id === profile._id) return;

        try {
            if (followed) {
                // --- UNFOLLOW ---
                await userApi.unfollow(profile._id);
                setFollowed(false);
                // Cập nhật số lượng follower ngay lập tức (giả lập)
                setProfile(prev => ({
                    ...prev, 
                    followers: prev.followers.filter(uid => uid !== currentUser._id)
                })); 
            } else {
                // --- FOLLOW ---
                await userApi.follow(profile._id);
                setFollowed(true);
                // Cập nhật số lượng follower ngay lập tức (giả lập)
                setProfile(prev => ({
                    ...prev, 
                    followers: [...prev.followers, currentUser._id]
                }));
            }
        } catch (error) {
            console.error("Follow error", error);
            alert("Có lỗi xảy ra khi Follow/Unfollow");
        }
    };

    // Hàm xử lý khi Update thành công từ Modal
    const handleUpdateSuccess = (updatedData) => {
        setProfile(prev => ({ ...prev, ...updatedData }));
    };

    if (!profile) return <div className="profile-wrapper" style={{textAlign: 'center', paddingTop: '50px'}}>Loading...</div>;

    const isMyProfile = currentUser && currentUser._id === profile._id;

    return (
        <div className="profile-wrapper">
            <div className="profile-container">
                <Link to="/" className="back-link">← Back to Feed</Link>

                <div className="profile-header">
                    <div className="profile-info">
                        <h2 className="profile-username">{profile.username}</h2>
                        <span className="profile-handle">universe.net</span>
                        
                        <div className="profile-bio">
                            {profile.bio || "No bio yet."}
                        </div>

                        {/* ... Stats ... */}
                        <div className="profile-stats">
                             <span><b>{profile.followers.length}</b> followers</span>
                             <span><b>{profile.following.length}</b> following</span>
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
                            Edit Profile
                        </button>
                    ) : (
                        <button 
                            onClick={handleFollow} 
                            className={`action-btn ${followed ? 'secondary' : 'primary'}`}
                        >
                            {followed ? "Unfollow" : "Follow"}
                        </button>
                    )}
                    <button className="action-btn secondary">Share Profile</button>
                </div>

                <div className="profile-tabs">
                    <div className="tab-item">Threads</div>
                </div>
                <div className="profile-posts">
                    <p style={{color: '#777', textAlign: 'center', marginTop: '20px'}}>No threads yet.</p>
                </div>

                {isEditing && (
                    <EditProfileModal 
                        user={profile}
                        onClose={() => setIsEditing(false)}
                        onUpdateSuccess={handleUpdateSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default Profile;