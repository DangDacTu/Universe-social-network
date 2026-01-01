import { useEffect, useState } from 'react';

// 👇 CHÚ Ý: Đã sửa đường dẫn thành ../../ (lùi 2 cấp)
import PostCard from '../../components/PostCard';
import postApi from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [desc, setDesc] = useState("");
    const { user } = useAuth();

    // Lấy danh sách bài viết khi vào trang
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await postApi.getTimeline();
                setPosts(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchPosts();
    }, []);

    // Xử lý đăng bài
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newPost = {
            desc: desc,
        };
        try {
            const res = await postApi.createPost(newPost);
            setPosts([res.data, ...posts]);
            setDesc("");
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="home-container" style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <div className="feed" style={{ width: '100%', maxWidth: '600px' }}>
                {/* Khu vực đăng bài */}
                <div className="share" style={{ padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                    <div className="share-top" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={user.profilePicture || "https://via.placeholder.com/50"} alt="" style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }} />
                        <input 
                            placeholder={`What's on your mind ${user.username}?`} 
                            style={{ border: 'none', width: '80%', outline: 'none' }}
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>
                    <hr style={{ margin: '20px 0' }} />
                    <button onClick={handleSubmit} style={{ padding: '7px 15px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Share
                    </button>
                </div>

                {/* Danh sách bài viết */}
                {posts.map((p) => (
                    <PostCard key={p._id} post={p} />
                ))}
            </div>
        </div>
    );
};

// 👇 ĐÂY LÀ DÒNG BẠN BỊ THIẾU
export default Home;