import { useState, useEffect, useRef } from "react";
import "./ChatSidebar.css";
import { FiEdit, FiSearch, FiLock, FiStar, FiSlash, FiClock, FiMessageCircle, FiAtSign, FiMessageSquare, FiRepeat, FiAlertCircle, FiType, FiBellOff, FiPlayCircle, FiHeart, FiShoppingBag, FiHelpCircle, FiShield, FiUser } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { BiBlock } from "react-icons/bi";
import { MdOutlinePrivacyTip } from "react-icons/md";

export default function ChatSidebar({ users, onlineUsers, selectedUser, onSelectUser, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ig-sidebar">
      <div className="ig-sidebar-header" ref={menuRef}>
        <div 
            className="ig-own-profile" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
            <span className="ig-username">Chat</span>
            {isMenuOpen ? <IoIosArrowUp size={16} /> : <IoIosArrowDown size={16} />}
        </div>
        
        <FiEdit size={24} className="ig-new-chat-icon" />

        {isMenuOpen && (
            <div className="ig-header-dropdown">
                <div className="ig-menu-section-title">Who can see your content</div>
                <div className="ig-menu-item"><FiLock size={20} /> Account privacy</div>
                <div className="ig-menu-item"><FiStar size={20} /> Close Friends</div>
                <div className="ig-menu-item"><BiBlock size={20} /> Blocked</div>
                <div className="ig-menu-item"><FiClock size={20} /> Story and location</div>

                <div className="ig-menu-section-title">How others can interact with you</div>
                <div className="ig-menu-item"><FiMessageCircle size={20} /> Messages and story replies</div>
                <div className="ig-menu-item"><FiAtSign size={20} /> Tags and mentions</div>
                <div className="ig-menu-item"><FiMessageSquare size={20} /> Comments</div>
                <div className="ig-menu-item"><FiRepeat size={20} /> Sharing and reuse</div>
                <div className="ig-menu-item"><FiAlertCircle size={20} /> Restricted accounts</div>
                <div className="ig-menu-item"><FiType size={20} /> Hidden Words</div>
                
                <div className="ig-menu-section-title">What you see</div>
                <div className="ig-menu-item"><FiBellOff size={20} /> Muted accounts</div>
                <div className="ig-menu-item"><FiPlayCircle size={20} /> Content preferences</div>
            </div>
        )}
      </div>

      <div className="ig-search-container">
        <div className="ig-search-box">
             <FiSearch className="ig-search-icon" size={18} />
             <input 
                type="text" 
                placeholder="Search" 
                className="ig-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
        </div>
      </div>

      <div className="ig-user-list">
        {filteredUsers.map((user) => {
           const isOnline = onlineUsers.includes(user._id);
           const isSelected = selectedUser?._id === user._id;

           return (
            <div 
                key={user._id} 
                className={`ig-user-item ${isSelected ? "selected" : ""}`}
                onClick={() => onSelectUser(user)}
            >
              <div className="ig-avatar-wrapper">
                <img src={user.profilePicture || "/avatar.jpg"} alt="" className="ig-avatar" />
                {isOnline && <div className="ig-online-dot"></div>}
              </div>

              <div className="ig-user-info">
                <span className="ig-user-name">{user.username}</span>
              </div>
            </div>
           );
        })}

        {filteredUsers.length === 0 && (
            <div style={{textAlign: 'center', color: '#8e8e8e', marginTop: 20}}>
                No account found.
            </div>
        )}
      </div>
    </div>
  );
}