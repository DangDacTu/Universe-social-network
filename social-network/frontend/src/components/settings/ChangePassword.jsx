import { useState } from "react";
import { useNavigate } from "react-router-dom";
import settingsApi from "../../api/settingApi";
import { useAuth } from "../../context/AuthContext";
import { FiLock, FiKey, FiCheckCircle } from "react-icons/fi";

export default function ChangePassword() {
    const { user } = useAuth();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("❌ Mật khẩu xác nhận không khớp");
            return;
        }
        if (oldPassword === newPassword) {
            alert("❌ Mật khẩu mới phải khác mật khẩu cũ");
            return;
        }
        if (newPassword.length < 6) {
             alert("❌ Mật khẩu mới phải có ít nhất 6 ký tự");
             return;
        }

        try {
            setLoading(true);
            await settingsApi.changePassword({ oldPassword, newPassword });
            
            alert("✅ Đổi mật khẩu thành công. Vui lòng đăng nhập lại!");
            localStorage.removeItem("accessToken");
            
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            
            navigate("/login");
        } catch (err) {
            alert(err.response?.data?.message || "❌ Mật khẩu cũ không đúng");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cp-container">
            {/* Header: User Info căn giữa */}
            <div className="cp-header">
                <div className="cp-avatar-wrapper">
                    <img 
                        src={user?.profilePicture || "/avatar.jpg"} 
                        alt="avatar" 
                        className="cp-avatar" 
                    />
                </div>
                <h3 className="cp-username">{user?.username}</h3>
                <p className="cp-subtitle">Quản lý bảo mật tài khoản</p>
            </div>

            <form className="cp-form" onSubmit={handleSubmit}>
                {/* Mật khẩu cũ */}
                <div className="cp-input-group">
                    <label>Mật khẩu hiện tại</label>
                    <div className="cp-input-wrapper">
                        <FiLock className="cp-icon" />
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu cũ..."
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="cp-input"
                            required
                        />
                    </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="cp-input-group">
                    <label>Mật khẩu mới</label>
                    <div className="cp-input-wrapper">
                        <FiKey className="cp-icon" />
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="cp-input"
                            required
                        />
                    </div>
                </div>

                {/* Xác nhận */}
                <div className="cp-input-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <div className="cp-input-wrapper">
                        <FiCheckCircle className="cp-icon" />
                        <input
                            type="password"
                            placeholder="Nhập lại mật khẩu mới..."
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="cp-input"
                            required
                        />
                    </div>
                </div>

                {/* Quên mật khẩu */}
                <div className="cp-forgot">
                    <span onClick={() => navigate('/forgot-password')}>Bạn quên mật khẩu?</span>
                </div>

                {/* Button */}
                <button type="submit" className="cp-btn-submit" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
            </form>
        </div>
    );
}