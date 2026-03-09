import { useEffect, useState } from "react";
import userApi from "../../api/userApi";
import PostItem from "../Post/PostItem";
import { FiBookmark } from "react-icons/fi";

export default function SavedPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedPosts = async () => {
            try {
                const res = await userApi.getSavedPosts();
                setPosts(res.data);
            } catch (error) {
                console.error("Lỗi tải bài viết đã lưu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedPosts();
    }, []);

    return (
        <div className="settings-form-container">
            <div className="cp-header">
                <div className="cp-avatar-wrapper" style={{ background: '#fff3e0' }}>
                    <FiBookmark size={28} color="#f57c00" style={{ margin: '14px' }} />
                </div>
                <div className="cp-header-info">
                    <h3 className="cp-username">Đã lưu</h3>
                    <p className="cp-subtitle">Các bài viết bạn đã đánh dấu</p>
                </div>
            </div>

            <div className="settings-body">
                <div className="saved-posts-list">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Đang tải...</div>
                    ) : posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post._id} style={{ borderBottom: "1px solid #eee" }}>
                                <PostItem post={post} /> 
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                            <FiBookmark size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                            <p>Bạn chưa lưu bài viết nào.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}