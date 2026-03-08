import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import settingsApi from "../../api/settingApi"; // Đảm bảo bạn đã có API này
import uploadApi from "../../api/uploadApi";    // Đảm bảo bạn đã có API này
import { FiCheck, FiImage, FiUploadCloud, FiLayout } from "react-icons/fi";

// Danh sách 12 màu/gradient mẫu
const PRESET_THEMES = [
    { id: 'default', value: '#f0f2f5', type: 'color', name: 'Mặc định' },
    { id: 'white', value: '#ffffff', type: 'color', name: 'Trắng tinh' },
    { id: 'dark', value: '#18191a', type: 'color', name: 'Tối (Dark Mode)' },
    { id: 'warm', value: '#fff4e6', type: 'color', name: 'Ấm áp' },
    { id: 'cool', value: '#e3f2fd', type: 'color', name: 'Mát mẻ' },
    { id: 'mint', value: '#e0f2f1', type: 'color', name: 'Bạc hà' },
    { id: 'lavender', value: '#f3e5f5', type: 'color', name: 'Oải hương' },
    { id: 'rose', value: '#fce4ec', type: 'color', name: 'Hoa hồng' },
    { id: 'gradient_1', value: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)', type: 'gradient', name: 'Bầu trời' },
    { id: 'gradient_2', value: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)', type: 'gradient', name: 'Hoàng hôn' },
    { id: 'gradient_3', value: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', type: 'gradient', name: 'Biển xanh' },
    { id: 'gradient_4', value: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)', type: 'gradient', name: 'Mây trắng' },
];

export default function AppearanceSettings() {
    const { user, updateUser } = useAuth();
    // Khởi tạo state từ user context (nếu có lưu) hoặc mặc định
    const [currentBg, setCurrentBg] = useState(user?.background || '#f0f2f5');
    const [bgType, setBgType] = useState(user?.backgroundType || 'color'); 
    const [loading, setLoading] = useState(false);

    // Hàm áp dụng background ngay lập tức (Preview trực tiếp lên body)
    const applyBackground = (value, type) => {
        if (type === 'image') {
            document.body.style.backgroundImage = `url(${value})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundColor = 'transparent';
        } else {
            document.body.style.backgroundImage = 'none';
            document.body.style.background = value;
        }
    };

    // Xử lý khi chọn màu có sẵn — cập nhật giao diện ngay, sau đó gọi API
    const handleSelectPreset = async (item) => {
        setCurrentBg(item.value);
        setBgType(item.type);
        applyBackground(item.value, item.type);
        // Cập nhật context ngay để MainLayout đổi nền ngay lập tức
        updateUser({ background: item.value, backgroundType: item.type });

        // 🔥 FIX: Cập nhật LocalStorage để giữ màu khi F5
        const savedUser = JSON.parse(localStorage.getItem("user")) || {};
        const newUser = { ...savedUser, background: item.value, backgroundType: item.type };
        localStorage.setItem("user", JSON.stringify(newUser));

        try {
            await settingsApi.updateAppearance({ background: item.value, type: item.type });
        } catch (error) {
            console.error("Lỗi lưu giao diện:", error);
        }
    };

    // Xử lý upload ảnh
    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            // 1. Upload ảnh lên server
            const res = await uploadApi.uploadFile(file);
            const imageUrl = res.data.url;

            setCurrentBg(imageUrl);
            setBgType('image');
            applyBackground(imageUrl, 'image');
            updateUser({ background: imageUrl, backgroundType: 'image' });

            // 🔥 FIX: Cập nhật LocalStorage cho ảnh upload
            const savedUser = JSON.parse(localStorage.getItem("user")) || {};
            const newUser = { ...savedUser, background: imageUrl, backgroundType: 'image' };
            localStorage.setItem("user", JSON.stringify(newUser));

            await settingsApi.updateAppearance({ background: imageUrl, type: 'image' });
        } catch (error) {
            alert("Lỗi tải ảnh lên! Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-form-container">
            <div className="cp-header">
                <div className="cp-avatar-wrapper" style={{ background: '#e0f2f1' }}>
                    <FiLayout size={28} color="#0095f6" style={{ margin: '14px' }} />
                </div>
                <div className="cp-header-info">
                    <h3 className="cp-username">Giao diện</h3>
                    <p className="cp-subtitle">Tùy chỉnh màu nền ứng dụng</p>
                </div>
            </div>
            
            {/* PHẦN 1: MÀU SẮC & GRADIENT */}
            <div className="appearance-section">
                <h4 className="appearance-title">Chọn màu có sẵn</h4>
                <div className="color-grid">
                    {PRESET_THEMES.map((theme) => (
                        <div 
                            key={theme.id}
                            className={`color-item ${currentBg === theme.value ? 'active' : ''}`}
                            style={{ background: theme.value }}
                            onClick={() => handleSelectPreset(theme)}
                            title={theme.name}
                        >
                            {currentBg === theme.value && <FiCheck className="check-icon" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* PHẦN 2: TẢI ẢNH LÊN */}
            <div className="appearance-section">
                <h4 className="appearance-title">Hoặc tải ảnh của bạn</h4>
                
                <label className="custom-bg-upload">
                    <input type="file" hidden accept="image/*" onChange={handleUploadImage} disabled={loading} />
                    
                    <div className="upload-placeholder">
                        {loading ? (
                            <div className="loader"></div>
                        ) : bgType === 'image' && currentBg && !currentBg.startsWith('#') && !currentBg.startsWith('linear') ? (
                            <img src={currentBg} alt="Custom bg" className="preview-bg-img" />
                        ) : (
                            <div className="upload-content">
                                <FiUploadCloud size={32} />
                                <span>Nhấn để tải ảnh nền (HD)</span>
                            </div>
                        )}
                    </div>

                    {/* Overlay hiệu ứng khi hover */}
                    {!loading && (
                        <div className="upload-overlay">
                            <FiImage /> Thay đổi ảnh
                        </div>
                    )}
                </label>
            </div>
        </div>
    );
}