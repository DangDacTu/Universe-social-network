/**
 * @file SettingsMenu.jsx
 * @description Menu cài đặt bên trái
 */
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
                <span className="icon"></span>
                <span>Đổi mật khẩu</span>
            </button>

            <button
                className={`settings-menu-item ${activeTab === "privacy" ? "active" : ""
                    }`}
                onClick={() => setActiveTab("privacy")}
                type="button"
            >
                <span className="icon"></span>
                <span>Quyền riêng tư</span>
            </button>
        </div>
    );
}