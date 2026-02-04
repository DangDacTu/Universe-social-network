import { FiLock, FiShield, FiUser, FiBell, FiBookmark, FiActivity, FiEyeOff, FiMessageCircle, FiAtSign, FiHeart, FiMonitor, FiHelpCircle, FiInfo } from "react-icons/fi";
import { BiArchive, BiTimeFive, BiBlock } from "react-icons/bi";
import { MdOutlinePrivacyTip, MdOutlineCleaningServices } from "react-icons/md";
import { HiOutlineStatusOnline } from "react-icons/hi";

export default function SettingsMenu({ activeTab, setActiveTab }) {
    const menuSections = [
        {
            title: "Cài đặt chính",
            items: [
                { id: "password", label: "Đổi mật khẩu", icon: <FiLock />, isDev: false },
                { id: "privacy", label: "Quyền riêng tư", icon: <FiShield />, isDev: false },
            ]
        },
        {
            title: "Cách bạn dùng ứng dụng",
            items: [
                { id: "saved", label: "Đã lưu", icon: <FiBookmark />, isDev: true },
                { id: "archive", label: "Kho lưu trữ", icon: <BiArchive />, isDev: true },
                { id: "activity", label: "Hoạt động", icon: <FiActivity />, isDev: true },
                { id: "notifications", label: "Thông báo", icon: <FiBell />, isDev: true },
            ]
        },
        {
            title: "Ai có thể xem nội dung",
            items: [
                { id: "account_privacy", label: "Quyền riêng tư TK", icon: <MdOutlinePrivacyTip />, isDev: true },
                { id: "blocked", label: "Đã chặn", icon: <BiBlock />, isDev: true },
                { id: "hide_story", label: "Ẩn tin", icon: <FiEyeOff />, isDev: true },
            ]
        },
        {
            title: "Tương tác",
            items: [
                { id: "messages", label: "Tin nhắn", icon: <FiMessageCircle />, isDev: true },
                { id: "tags", label: "Gắn thẻ", icon: <FiAtSign />, isDev: true },
                { id: "comments", label: "Bình luận", icon: <MdOutlineCleaningServices />, isDev: true },
            ]
        },
        {
            title: "Thông tin & Hỗ trợ",
            items: [
                { id: "help", label: "Trợ giúp", icon: <FiHelpCircle />, isDev: true },
                { id: "about", label: "Giới thiệu", icon: <FiInfo />, isDev: true },
            ]
        }
    ];

    const handleItemClick = (item) => {
        if (item.isDev) alert(`Tính năng "${item.label}" đang phát triển!`);
        else setActiveTab(item.id);
    };

    return (
        <div className="settings-menu">
            <h3 className="settings-menu-main-title">Cài đặt</h3>
            <div className="menu-scroll-container">
                {menuSections.map((section, index) => (
                    <div key={index} className="menu-section">
                        <h4 className="menu-section-title">{section.title}</h4>
                        <div className="menu-list">
                            {section.items.map((item) => (
                                <button key={item.id} type="button"
                                    className={`settings-menu-item ${activeTab === item.id ? "active" : ""}`}
                                    onClick={() => handleItemClick(item)}>
                                    <span className="menu-icon">{item.icon}</span>
                                    <span className="menu-label">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}