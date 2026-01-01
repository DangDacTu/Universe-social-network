import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'timeago.js'; // Thư viện hiển thị thời gian "5 mins ago"
import { useAuth } from '../context/AuthContext';
//import postApi from '../api/postApi';

const PostCard = ({ post }) => {
    // State lưu số lượng like và trạng thái đã like chưa
    const [like, setLike] = useState(post.likes.length);
    const [isLiked, setIsLiked] = useState(false);
    const { user: currentUser } = useAuth();

    // Kiểm tra xem user hiện tại đã like bài này chưa khi load component
    useEffect(() => {
        setIsLiked(post.likes.includes(currentUser._id));
    }, [currentUser._id, post.likes]);

    // Xử lý khi bấm nút Like
    const likeHandler = async () => {
        try {
            await postApi.likePost(post._id);
        } catch (err) {
            console.log(err);
        }
        setLike(isLiked ? like - 1 : like + 1);
        setIsLiked(!isLiked);
    };

    return (
        <div className="post-card" style={styles.card}>
            {/* 1. Phần Header: Avatar + Tên + Thời gian */}
            <div className="post-top" style={styles.top}>
                <div style={styles.topLeft}>
                    <Link to={`/profile/${post.user._id}`}>
                        <img
                            src={post.user.profilePicture || "https://via.placeholder.com/150"}
                            alt=""
                            style={styles.avatar}
                        />
                    </Link>
                    <span style={styles.username}>{post.user.username}</span>
                    <span style={styles.date}>{format(post.createdAt)}</span>
                </div>
            </div>
            
            {/* 2. Phần Nội dung: Text + Ảnh */}
            <div className="post-center" style={styles.center}>
                <p style={styles.desc}>{post.desc}</p>
                {post.img && <img src={post.img} alt="" style={styles.postImg} />}
            </div>
            
            {/* 3. Phần Footer: Nút Like */}
            <div className="post-bottom" style={styles.bottom}>
                <div className="post-bottom-left" style={styles.bottomLeft} onClick={likeHandler}>
                    <span style={{ fontSize: '24px', marginRight: '5px' }}>
                        {isLiked ? "❤️" : "🤍"}
                    </span>
                    <span style={styles.likeCounter}>{like} people like it</span>
                </div>
            </div>
        </div>
    );
};

// CSS viết ngay trong file cho gọn
const styles = {
    card: {
        width: '100%',
        borderRadius: '10px',
        boxShadow: '0px 0px 16px -8px rgba(0,0,0,0.68)',
        margin: '30px 0',
        padding: '20px',
        backgroundColor: 'white'
    },
    top: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
    },
    topLeft: {
        display: 'flex',
        alignItems: 'center'
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        objectFit: 'cover',
        marginRight: '10px',
        cursor: 'pointer'
    },
    username: {
        fontSize: '15px',
        fontWeight: '500',
        margin: '0 10px',
        color: '#333'
    },
    date: {
        fontSize: '12px',
        color: 'gray'
    },
    center: {
        margin: '20px 0'
    },
    desc: {
        marginBottom: '15px'
    },
    postImg: {
        width: '100%',
        maxHeight: '500px',
        objectFit: 'contain',
        borderRadius: '5px'
    },
    bottom: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    bottomLeft: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer'
    }
};

export default PostCard;