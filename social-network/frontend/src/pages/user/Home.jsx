import { useState } from "react";
import PostInput from "../../components/post/PostInput";
import PostList from "../../components/post/PostList";
import CreatePostModal from "../../components/Post/CreatePostModal";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [reload, setReload] = useState(false);

  return (
    <>
      {/* ===== CSS INLINE NGAY TRONG FILE ===== */}
      <style>
        {`
          /* ẨN SCROLLBAR - Chrome / Edge / Safari */
          .feed-scroll::-webkit-scrollbar {
            display: none;
          }

          /* Firefox */
          .feed-scroll {
            scrollbar-width: none;
          }

          /* Edge cũ */
          .feed-scroll {
            -ms-overflow-style: none;
            scroll-behavior: smooth;
          }
        `}
      </style>

        {/* KHUNG FEED TRẮNG */}
        <div
          style={{
            width: "650px",
            background: "#fff",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            maxHeight: "100%",
          }}
        >
          {/* INPUT LUÔN Ở TRÊN */}
          <div style={{ padding: "16px", borderBottom: "1px solid #eee" }}>
            <PostInput onOpen={() => setOpen(true)} />
          </div>

          {/* POST LIST CUỘN */}
          <div
            className="feed-scroll"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "0 16px",
            }}
          >
            <PostList reload={reload} />
          </div>
        </div>
      
      {open && (
        <CreatePostModal
          onClose={() => setOpen(false)}
          onSuccess={() => setReload(!reload)}
        />
      )}
    </>
  );
}