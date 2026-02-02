/**
 * @file PrivacySettings.jsx
 * @author moi
 * @description
 * Component cài đặt quyền riêng tư
 */
import { useEffect, useState } from "react";
import settingsApi from "../../api/settingApi";

export default function PrivacySettings() {
    const [settings, setSettings] = useState({
        allowMessage: true,
        showOnlineStatus: true,
    });

    useEffect(() => {
        settingsApi.getSettings().then((res) => {
            setSettings(res.data);
        });
    }, []);

    const handleChange = async (e) => {
        const { name, checked } = e.target;
        const newSettings = { ...settings, [name]: checked };
        setSettings(newSettings);

        await settingsApi.updatePrivacy(newSettings);
    };

    return (
        <div className="settings-form">
            <h3 className="privacy-title">Quyền riêng tư(đang phát triển)</h3>

            <label>
                <input
                    type="checkbox"
                    name="allowMessage"
                    checked={settings.allowMessage}
                    onChange={handleChange}
                />
                Cho phép người khác nhắn tin
            </label>

            <label>
                <input
                    type="checkbox"
                    name="showOnlineStatus"
                    checked={settings.showOnlineStatus}
                    onChange={handleChange}
                />
                Hiển thị trạng thái online
            </label>
        </div>
    );
}