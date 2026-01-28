/**
 * @file SettingsMenu.jsx
 * @description Menu cài đặt bên trái
 */
import {
    FaLock,
    FaUserShield,
    FaBell,
    FaPalette,
    FaUserCog,
    FaQuestionCircle
} from "react-icons/fa";
export default function SettingsMenu({ activeTab, setActiveTab }) {
    const comingSoon = () => {
        alert("Tính năng đang phát triển");
    };

    return (
        <div className="settings-menu">
            <h3 className="settings-menu-title">Cài đặt</h3>

            {/* Đổi mật khẩu */}
            <button
                className={`settings-menu-item ${activeTab === "password" ? "active" : ""
                    }`}
                onClick={() => setActiveTab("password")}
                type="button"
            >
                <FaLock className="settings-menu-icon" />
                <span>Đổi mật khẩu</span>
            </button>

            {/* Quyền riêng tư */}
            <button
                className={`settings-menu-item ${activeTab === "privacy" ? "active" : ""
                    }`}
                onClick={() => setActiveTab("privacy")}
                type="button"
            >
                <FaUserShield className="settings-menu-icon" />
                <span>Quyền riêng tư</span>
            </button>

            {/* Các mục đang phát triển */}
            <button className="settings-menu-item" onClick={comingSoon}>
                <FaBell className="settings-menu-icon" />
                <span>Thông báo</span>
            </button>

            <button className="settings-menu-item" onClick={comingSoon}>
                <FaPalette className="settings-menu-icon" />
                <span>Giao diện</span>
            </button>

            <button className="settings-menu-item" onClick={comingSoon}>
                <FaUserCog className="settings-menu-icon" />
                <span>Tài khoản</span>
            </button>

            <button className="settings-menu-item" onClick={comingSoon}>
                <FaQuestionCircle className="settings-menu-icon" />
                <span>Trợ giúp</span>
            </button>
        </div>
    );
}
