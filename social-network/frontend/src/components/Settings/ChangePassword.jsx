/**
 * @file ChangePassword.jsx
 * @author moi
 * @description
 * Component đổi mật khẩu
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import settingsApi from "../../api/settingApi";

export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Validate frontend
        if (newPassword !== confirmPassword) {
            alert("❌ Mật khẩu mới không khớp");
            return;
        }

        if (oldPassword === newPassword) {
            alert("❌ Mật khẩu mới phải khác mật khẩu cũ");
            return;
        }

        try {
            setLoading(true);

            await settingsApi.changePassword({
                oldPassword,
                newPassword,
            });

            alert("✅ Đổi mật khẩu thành công. Vui lòng đăng nhập lại!");

            // ✅ Logout sau khi đổi mật khẩu
            localStorage.removeItem("accessToken");

            // Reset form
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

            navigate("/login");
        } catch (err) {
            alert(err.response?.data?.message || "❌ Lỗi đổi mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="settings-form" onSubmit={handleSubmit}>
            <h3>Đổi mật khẩu</h3>

            <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                value={oldPassword || ""}
                onChange={(e) => setOldPassword(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Mật khẩu mới"
                value={newPassword || ""}
                onChange={(e) => setNewPassword(e.target.value)}
                required
            />

            {/* ✅ Thêm xác nhận mật khẩu */}
            <input
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />

            <button disabled={loading}>
                {loading ? "Đang xử lý..." : "Cập nhật"}
            </button>
        </form>
    );
}
