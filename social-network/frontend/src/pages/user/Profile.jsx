import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userApi from '../../api/userApi';

const Profile = () => {
    const { id } = useParams(); // Lấy ID từ URL (vd: /profile/123)
    const { user: currentUser } = useAuth(); // User đang đăng nhập
    const [profile, setProfile] = useState(null);
    const [followed, setFollowed] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Nếu không có id trên URL, mặc định lấy profile của người đang đăng nhập
                const userId = id || currentUser._id;
                const { data } = await userApi.getUser(userId);
                setProfile(data);

                // Kiểm tra xem current user đã follow người này chưa
                if (data.followers.includes(currentUser._id)) {
                    setFollowed(true);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };
        fetchProfile();
    }, [id, currentUser]);

    const handleFollow = async () => {
        try {
            if (followed) {
                await userApi.unfollow(profile._id);
                setFollowed(false);
                // Giảm số lượng follower hiển thị tạm thời
                setProfile(prev => ({...prev, followers: prev.followers.slice(0, -1)})); 
            } else {
                await userApi.follow(profile._id);
                setFollowed(true);
                // Tăng số lượng follower hiển thị tạm thời
                setProfile(prev => ({...prev, followers: [...prev.followers, currentUser._id]}));
            }
        } catch (error) {
            console.error("Follow error", error);
        }
    };

    if (!profile) return <div>Loading...</div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <img 
                    src={profile.profilePicture || "https://via.placeholder.com/150"} 
                    alt="Avatar" 
                    className="avatar"
                    style={{width: '100px', height: '100px', borderRadius: '50%'}}
                />
                <div>
                    <h2>{profile.username}</h2>
                    <p>{profile.bio || "No bio yet."}</p>
                    <div className="stats">
                        <span>{profile.followers.length} Followers</span>
                        <span style={{marginLeft: '10px'}}>{profile.following.length} Following</span>
                    </div>
                    
                    {/* Chỉ hiện nút Follow nếu profile không phải là của chính mình */}
                    {currentUser._id !== profile._id && (
                        <button onClick={handleFollow} style={{marginTop: '10px'}}>
                            {followed ? "Unfollow" : "Follow"}
                        </button>
                    )}
                    
                    {currentUser._id === profile._id && (
                        <button style={{marginTop: '10px'}}>Edit Profile</button>
                    )}
                </div>
            </div>
            <hr />
            <div className="profile-posts">
                <h3>Posts</h3>
                {/* Phần hiển thị bài viết sẽ do Thành viên 2 làm */}
                <p>No posts yet.</p>
            </div>
        </div>
    );
};

export default Profile;