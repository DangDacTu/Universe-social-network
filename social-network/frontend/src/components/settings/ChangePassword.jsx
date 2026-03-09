import { useState } from "react";
import { useNavigate } from "react-router-dom";
import settingsApi from "../../api/settingApi";
import { useAuth } from "../../context/AuthContext";
import { FiLock, FiKey, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";

export default function ChangePassword() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State quản lý dữ liệu nhập vào
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // State quản lý ẩn/hiện mật khẩu
    const [showPass, setShowPass] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Xử lý nhập liệu
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(""); // Xóa lỗi khi người dùng nhập lại
    };

    // Xử lý ẩn/hiện mật khẩu
    const toggleShow = (field) => {
        setShowPass({ ...showPass, [field]: !showPass[field] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { oldPassword, newPassword, confirmPassword } = formData;

        if (newPassword !== confirmPassword) {
            return setError("Mật khẩu xác nhận không khớp.");
        }
        if (newPassword.length < 8) {
             return setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
        }

        try {
            setLoading(true);
            await settingsApi.changePassword({ oldPassword, newPassword });
            alert("Đổi mật khẩu thành công. Vui lòng đăng nhập lại!");
            localStorage.removeItem("token");
            navigate("/login");
        } catch (err) {
            console.error("Change Password Error:", err); 
            setError(err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Helper render input để code gọn hơn
    const renderInput = (label, name, placeholder, icon, showKey) => {
        const Icon = icon;
        return (
            <div className="cp-input-group">
                <label>{label}</label>
                <div className="cp-input-wrapper">
                    <Icon className="cp-icon" />
                    <input
                        type={showPass[showKey] ? "text" : "password"}
                        name={name}
                        placeholder={placeholder}
                        value={formData[name]}
                        onChange={handleChange}
                        className="cp-input"
                        style={{ paddingRight: '40px' }}
                        required
                    />
                    <button 
                        type="button" 
                        onClick={() => toggleShow(showKey)}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
                    >
                        {showPass[showKey] ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="settings-form-container">
            <div className="cp-header">
                <div className="cp-avatar-wrapper">
                    <img src={user?.profilePicture || "/avatar.jpg"} alt="avatar" className="cp-avatar" />
                </div>
                <div className="cp-header-info">
                    <h3 className="cp-username">{user?.username}</h3>
                    <p className="cp-subtitle">Quản lý bảo mật</p>
                </div>
            </div>

            <div className="settings-body">
                {error && (
                    <div style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>
                        ⚠️ {error}
                    </div>
                )}

                <form className="cp-form" onSubmit={handleSubmit}>
                    {renderInput("Mật khẩu hiện tại", "oldPassword", "Nhập mật khẩu cũ...", FiLock, "old")}
                    {renderInput("Mật khẩu mới", "newPassword", "Nhập mật khẩu mới...", FiKey, "new")}
                    {renderInput("Xác nhận mật khẩu", "confirmPassword", "Nhập lại mật khẩu mới...", FiCheckCircle, "confirm")}

                    <button type="submit" className="cp-btn-submit" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </button>
                </form>
            </div>
        </div>
    );
}