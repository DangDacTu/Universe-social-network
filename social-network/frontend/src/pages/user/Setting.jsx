import { useState } from "react";
import SettingsMenu from "../../components/settings/SettingsMenu";
import ChangePassword from "../../components/settings/ChangePassword";
import PrivacySettings from "../../components/settings/PrivacySettings";
import AppearanceSettings from "../../components/settings/AppearanceSettings"; // 🔥 Import file mới
import "./Settings.css";

export default function Settings() {
    const [activeTab, setActiveTab] = useState("password");

    return (
        <div className="settings-wrapper">
            <div className="settings-container">
                <SettingsMenu activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="settings-content">
                    {/* Tab Đổi Mật Khẩu */}
                    {activeTab === "password" && (
                        <div className="settings-card">
                            <ChangePassword />
                        </div>
                    )}

                    {/* Tab Quyền Riêng Tư */}
                    {activeTab === "privacy" && (
                        <div className="settings-card">
                            <PrivacySettings />
                        </div>
                    )}

                    {/* 🔥 TAB GIAO DIỆN MỚI */}
                    {activeTab === "appearance" && (
                        <div className="settings-card">
                            <AppearanceSettings />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
