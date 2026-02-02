/**
 * @file Setting.jsx
 * Trang cài đặt người dùng
 */
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

                {/* Header */}
                <div className="settings-header">
                    <h2 className="setting-title">Cài đặt tài khoản</h2>
                    <p>Quản lý bảo mật và quyền riêng tư của bạn</p>
                </div>

                <div className="settings-body">
                    {/* Menu bên trái */}
                    <SettingsMenu
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    {/* Nội dung bên phải */}
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
        </div>
    );
}