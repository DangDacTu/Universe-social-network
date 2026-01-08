import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import PostInput from "../../components/post/PostInput";
import PostList from "../../components/post/PostList";
import CreatePostModal from "../../components/post/CreatePostModal";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [reload, setReload] = useState(false);

  return (
    <>
      <Sidebar />

      <main
        style={{
          marginLeft: "80px",
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          justifyContent: "center",
          paddingTop: "24px",
        }}
      >
        <div
          style={{
            width: "600px",
            background: "#fff",
            borderRadius: "16px",
            padding: "16px",
          }}
        >
          <PostInput onOpen={() => setOpen(true)} />
          <PostList reload={reload} />
          
        </div>
      </main>

      {open && <CreatePostModal
        onClose={() => setOpen(false)}
        onSuccess={() => setReload(!reload)}
      />
      }
    </>
  );
}
