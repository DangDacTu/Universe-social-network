import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import PostItem from "./PostItem";

export default function PostList({ reload }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [reload]);

  const fetchPosts = async () => {
    try {
      const res = await axiosClient.get("/posts");

      console.log("POST LIST RESPONSE:", res.data);

      // 🔥 API trả về MẢNG
      setPosts(res.data);
    } catch (err) {
      console.error("FETCH POSTS ERROR:", err);
    }
  };

  return (
    <div>
      {posts.length === 0 && (
        <p style={{ textAlign: "center", color: "#888" }}>
          Chưa có bài viết nào
        </p>
      )}

      {posts.map((post) => (
        <PostItem key={post._id} post={post} />
      ))}
    </div>
  );
}
