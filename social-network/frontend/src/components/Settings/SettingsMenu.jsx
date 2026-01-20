/**
 * @file SettingsMenu.jsx
 * @description Menu cài đặt bên trái
 */
import { FaLock, FaUserShield } from "react-icons/fa";
export default function SettingsMenu({ activeTab, setActiveTab }) {
    return (
        <div className="settings-menu">
            <h3 className="settings-menu-title">Cài đặt</h3>

            <button
                className={`settings-menu-item ${activeTab === "password" ? "active" : ""
                    }`}
                onClick={() => setActiveTab("password")}
                type="button"
            >
                <FaLock className="settings-menu-icon" />
                <span>Đổi mật khẩu</span>
            </button>

            <button
                className={`settings-menu-item ${activeTab === "privacy" ? "active" : ""
                    }`}
                onClick={() => setActiveTab("privacy")}
                type="button"
            >
                <FaUserShield className="settings-menu-icon" />
                <span>Quyền riêng tư</span>
            </button>
        </div>
    );
}
