import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import CreatePostModal from "../Post/CreatePostModal";

export default function MainLayout() {
  const [openCreate, setOpenCreate] = useState(false);

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