import "./Sidebar.css";
import {
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiHeart,
  FiUser,
  FiMenu,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ onCreate }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* ===== LOGO TOP (CLICK → HOME) ===== */}
      <div
        className="sidebar-logo"
        onClick={() => navigate("/")}
      >
        <img src="/logo-universe.png" alt="Logo" />
      </div>

      <nav className="sidebar-nav">
        <button
          className="sidebar-item active"
          onClick={() => navigate("/")}
        >
          <FiHome />
        </button>

        <button className="sidebar-item">
          <FiSearch />
        </button>

        <button className="sidebar-item create" onClick={onCreate}>
          <FiPlusSquare />
        </button>

        <button className="sidebar-item">
          <FiHeart />
        </button>

        {/* ✅ USER → /me */}
        <button
          className="sidebar-item"
          onClick={() => navigate("/me")}
        >
          <FiUser />
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-item">
          <FiMenu />
        </button>
      </div>
    </aside>
  );
}