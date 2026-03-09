import { useState } from "react";
import SettingsMenu from "../../components/settings/SettingsMenu";
import ChangePassword from "../../components/settings/ChangePassword";
import PrivacySettings from "../../components/settings/PrivacySettings";
import AppearanceSettings from "../../components/settings/AppearanceSettings"; 
import AboutSettings from "../../components/settings/AboutSettings";
import SavedPosts from "../../components/settings/SavedPosts"; 
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

                    {/* TAB GIAO DIỆN MỚI */}
                    {activeTab === "appearance" && (
                        <div className="settings-card">
                            <AppearanceSettings />
                        </div>
                    )}

                    {/* TAB ĐÃ LƯU */}
                    {activeTab === "saved" && (
                        <div className="settings-card">
                            <SavedPosts />
                        </div>
                    )}

                    {/* Tab Giới thiệu */}
                    {activeTab === "about" && (
                        <div className="settings-card">
                            <AboutSettings />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
