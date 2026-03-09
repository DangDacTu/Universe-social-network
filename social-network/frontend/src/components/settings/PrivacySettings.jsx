import { useState } from "react";
import { FiShield } from "react-icons/fi";

export default function PrivacySettings() {
    const [settings, setSettings] = useState({
        allowMessage: true,
        showOnlineStatus: true,
    });

    const handleToggle = (key) => {
        // Chỉ thay đổi giao diện, không gọi API
        setSettings({ ...settings, [key]: !settings[key] });
    };

    return (
        <div className="settings-form-container">
            <div className="cp-header">
                <div className="cp-avatar-wrapper" style={{ background: '#e8f5e9' }}>
                    <FiShield size={28} color="#2e7d32" style={{ margin: '14px' }} />
                </div>
                <div className="cp-header-info">
                    <h3 className="cp-username">Quyền riêng tư</h3>
                    <p className="cp-subtitle">Quản lý trạng thái hoạt động và tin nhắn</p>
                </div>
            </div>
            
            <div className="settings-body">
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
        </div>
    );
}