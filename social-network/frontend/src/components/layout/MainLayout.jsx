import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import CreatePostModal from "../Post/CreatePostModal";
import { useAuth } from "../../context/AuthContext";
import { connectSocket } from "../../services/socket";

export default function MainLayout() {
  const [openCreate, setOpenCreate] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Yêu cầu quyền hiển thị thông báo của trình duyệt
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const socket = connectSocket(user._id);

    const handleNewNotification = (notification) => {
      setHasNewNotification(true);
      // Hiển thị thông báo trên trình duyệt nếu được cho phép
      if (Notification.permission === "granted") {
        const notificationMessage = `${notification.from.username} đã ${notification.type === 'like' ? 'thích bài viết' : (notification.type === 'comment' ? 'bình luận' : 'bắt đầu theo dõi bạn')}.`;
        new Notification("Universe", {
          body: notificationMessage,
          icon: notification.from.profilePicture || "/logo-universe.png",
        });
      }
    };

    socket.on("new-notification", handleNewNotification);
    return () => { socket.off("new-notification", handleNewNotification); };
  }, [user]);

  return (
    <>
      <Sidebar onCreate={() => setOpenCreate(true)} hasNewNotification={hasNewNotification} onNotifClick={() => setHasNewNotification(false)} />

      <main
        className="main-layout-content"
        style={{
          marginLeft: "80px",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          paddingTop: "24px",
          background: "transparent", // Để lộ màu nền của body (do App.jsx quản lý)
        }}
      >
        <Outlet />
      </main>

      {/* MODAL GLOBAL */}
      {openCreate && (
        <CreatePostModal onClose={() => setOpenCreate(false)} />
      )}
    </>
  );
}