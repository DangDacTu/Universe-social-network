import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userApi from '../../api/userApi';
import './Profile.css';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [followed, setFollowed] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = id || currentUser?._id;
                if (!userId) return;

                const { data } = await userApi.getUser(userId);
                setProfile(data);

                if (currentUser && data.followers.includes(currentUser._id)) {
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

                        <div className="profile-stats">
                            <span><b>{profile.followers.length}</b> followers</span>
                            <span><b>{profile.following.length}</b> following</span>
                        </div>
                    </div>

                    <div className="profile-avatar-container">
                        {/* 👇 Hiển thị ảnh Avatar từ DB (Link DiceBear) */}
                        <img 
                            src={profile.profilePicture || "https://via.placeholder.com/150"} 
                            alt="Avatar" 
                            className="profile-avatar"
                        />
                    </div>
                </div>

                <div className="profile-actions">
                    {isMyProfile ? (
                        <button className="action-btn secondary">Edit Profile</button>
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
            </div>
        </div>
    );
};

export default Profile;