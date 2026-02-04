import { useState } from "react";
import SettingsMenu from "../../components/Settings/SettingsMenu";
import ChangePassword from "../../components/Settings/ChangePassword";
import PrivacySettings from "../../components/Settings/PrivacySettings";
import "./Settings.css";

export default function Settings() {
    const [activeTab, setActiveTab] = useState("password");

    return (
        <div className="settings-wrapper">
            <div className="settings-container">
                {/* Menu bên trái (Cố định chiều cao, có scroll) */}
                <SettingsMenu
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {/* Nội dung bên phải (Cuộn độc lập) */}
                <div className="settings-content">
                    {activeTab === "password" && (
                        <div className="settings-card">
                            <ChangePassword />
                        </div>
                    )}

                    {activeTab === "privacy" && (
                        <div className="settings-card">
                            <PrivacySettings />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}