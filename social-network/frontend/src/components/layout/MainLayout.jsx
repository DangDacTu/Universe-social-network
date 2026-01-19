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
        style={{
          marginLeft: "80px",
          height: "100vh",
          background: "#f1f1f1",
          display: "flex",
          justifyContent: "center",
          paddingTop: "24px",
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
