import "./Sidebar.css";
import {
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiHeart,
  FiUser,
  FiMenu,
} from "react-icons/fi";

export default function Sidebar({ onCreate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"></div>

      <nav className="sidebar-nav">
        <button className="sidebar-item active">
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

        <button className="sidebar-item">
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
