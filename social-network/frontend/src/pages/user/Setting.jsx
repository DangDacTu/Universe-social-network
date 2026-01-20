/**
 * @file Settings.jsx
 * Trang cài đặt người dùng (Threads style)
 */
import { useState } from "react";
import SettingsMenu from "../../components/Settings/SettingsMenu";
import ChangePassword from "../../components/Settings/ChangePassword";
import PrivacySettings from "../../components/Settings/PrivacySettings";
import "./Settings.css";
import { FaCog } from "react-icons/fa";

export default function Settings() {
    const [activeTab, setActiveTab] = useState("password");

    return (
        <div className="settings-wrapper">
            <div className="settings-container">

                {/* Header */}
                <div className="settings-header">
                    <h2 className="setting-title">
                        <FaCog className="settings-title-icon" />
                        Cài đặt
                    </h2>
                    <p>Quản lý tài khoản, quyền riêng tư và bảo mật</p>
                </div>

                {/* Khung chính */}
                <div className="settings-frame">
                    <div className="settings-body">

                        {/* Menu trái */}
                        <SettingsMenu
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />

                        {/* Nội dung phải */}
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
        </div>
    );
}
