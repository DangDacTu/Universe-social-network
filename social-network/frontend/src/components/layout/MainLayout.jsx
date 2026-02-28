import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import CreatePostModal from "../Post/CreatePostModal";
import { useAuth } from "../../context/AuthContext";

export default function MainLayout() {
  const [openCreate, setOpenCreate] = useState(false);
  const { user } = useAuth();

  // Dùng màu nền từ Cài đặt giao diện (user.background), không hardcode
  const bgStyle = user?.background
    ? user.backgroundType === "image"
      ? {
          backgroundImage: `url(${user.background})`,
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundColor: "transparent",
        }
      : {
          background: user.background,
          backgroundImage: "none",
        }
    : { background: "#f1f1f1" };

  return (
    <>
      <Sidebar onCreate={() => setOpenCreate(true)} />

      <main
        className="main-layout-content"
        style={{
          marginLeft: "80px",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          paddingTop: "24px",
          ...bgStyle,
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