import "./Sidebar.css";
import {
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiHeart,
  FiUser,
  FiMenu,
  FiSend,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ onCreate }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const { logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate("/")}>
        <img src="/logo-universe.png" alt="Logo" />
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${isActive("/") ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          <FiHome />
        </button>

        <button className="sidebar-item"
          onClick={() => navigate("/search")}
        >
          <FiSearch />
        </button>

        <button className="sidebar-item create" onClick={onCreate}>
          <FiPlusSquare />
        </button>

        <button className="sidebar-item">
          <FiHeart />
        </button>

        <button className="sidebar-item"
          onClick={() => navigate("/chat")}
        >
          <FiSend />
        </button>

        <button
          className={`sidebar-item ${isActive("/me") ? "active" : ""}`}
          onClick={() => navigate("/me")}
        >
          <FiUser />
        </button>
      </nav>

      <div className="sidebar-bottom" ref={menuRef}>
        <button
          className="sidebar-item"
          onClick={() => setOpenMenu(!openMenu)}
        >
          <FiMenu />
        </button>

        {openMenu && (
          <div className="sidebar-dropup">
            <div
              className="dropup-item"
              onClick={() => {
                setOpenMenu(false);
                navigate("/settings");
              }}
            >
              <FiSettings />
              <span>Cài đặt</span>
            </div>

            <div
              className="dropup-item logout"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <FiLogOut />
              <span>Đăng xuất</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}