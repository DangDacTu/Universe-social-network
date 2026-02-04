import { useEffect, useState } from "react";
import settingsApi from "../../api/settingApi";

export default function PrivacySettings() {
    const [settings, setSettings] = useState({
        allowMessage: true,
        showOnlineStatus: true,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        settingsApi.getSettings()
            .then((res) => {
                setSettings(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleToggle = async (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings); // Optimistic UI update
        
        try {
            await settingsApi.updatePrivacy(newSettings);
        } catch (error) {
            console.error("Lỗi cập nhật", error);
            setSettings({ ...settings, [key]: settings[key] }); // Revert nếu lỗi
        }
    };

    if (loading) return <div className="loading-text">Đang tải cài đặt...</div>;

    return (
        <div className="settings-form-container">
            <h2 className="section-heading">Quyền riêng tư tài khoản</h2>
            
            <div className="toggle-list-wrapper">
                {/* Mục 1: Trạng thái Online */}
                <div className="toggle-item">
                    <div className="toggle-info">
                        <h4>Trạng thái hoạt động</h4>
                        <p>Cho phép các tài khoản bạn theo dõi và bất kỳ ai bạn nhắn tin cùng biết khi nào bạn hoạt động lần cuối.</p>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={settings.showOnlineStatus} 
                            onChange={() => handleToggle('showOnlineStatus')} 
                        />
                        <span className="slider round"></span>
                    </label>
                </div>

                {/* Mục 2: Nhắn tin */}
                <div className="toggle-item">
                    <div className="toggle-info">
                        <h4>Cho phép tin nhắn</h4>
                        <p>Cho phép mọi người gửi tin nhắn trực tiếp cho bạn.</p>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={settings.allowMessage} 
                            onChange={() => handleToggle('allowMessage')} 
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
                
                {/* Mục giả lập thêm cho đầy đặn */}
                <div className="toggle-item disabled">
                    <div className="toggle-info">
                        <h4 style={{ color: '#ccc' }}>Tài khoản riêng tư</h4>
                        <p style={{ color: '#ccc' }}>Khi tài khoản riêng tư, chỉ những người bạn phê duyệt mới có thể xem ảnh và video của bạn. (Sắp ra mắt)</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox" disabled />
                        <span className="slider round" style={{ background: '#eee' }}></span>
                    </label>
                </div>
            </div>
        </div>
    );
}