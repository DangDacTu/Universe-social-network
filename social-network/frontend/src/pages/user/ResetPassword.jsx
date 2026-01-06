import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import "./ResetPassword.css"; 

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    //  State để quản lý ẩn/hiện mật khẩu
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        // 1. Kiểm tra độ dài 8 ký tự
        if (password.length < 8) {
            setMessage("Password must be at least 8 characters.");
            return;
        }

        // 2. Kiểm tra khớp mật khẩu
        if (password !== confirmPassword) {
            setMessage("Confirm password does not match.");
            return;
        }

        setIsLoading(true);

        try {
            await authApi.resetPassword(token, password);
            setMessage("Password reset successfully! Redirecting...");
            
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Token expired or invalid.";
            setMessage(`Error: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Component Icon Mắt (SVG) để code gọn hơn
    const EyeIcon = ({ isVisible }) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {isVisible ? (
                // Icon Mắt Mở (Hiện pass)
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
            ) : (
                // Icon Mắt Gạch (Ẩn pass)
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.45-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor" />
            )}
        </svg>
    );

    return (
        <div className="reset-wrapper">
            <div className="reset-container">
                <div className="threads-logo-bg"></div>

                <h2>Reset Password</h2>
                <p className="sub-text">Enter your new password below.</p>

                <form onSubmit={handleSubmit}>
                    
                    {/* Ô nhập Mật khẩu mới */}
                    <div className="input-wrapper">
                        <input 
                            className="reset-input"
                            type={showPass ? "text" : "password"} // Thay đổi type dựa vào state
                            placeholder="New Password (min 8 chars)" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            minLength="8" // HTML validation
                        />
                        <button 
                            type="button" 
                            className="eye-icon"
                            onClick={() => setShowPass(!showPass)}
                        >
                            <EyeIcon isVisible={showPass} />
                        </button>
                    </div>

                    {/* Ô nhập Xác nhận mật khẩu */}
                    <div className="input-wrapper">
                        <input 
                            className="reset-input"
                            type={showConfirmPass ? "text" : "password"} // Thay đổi type dựa vào state
                            placeholder="Confirm New Password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                        />
                        <button 
                            type="button" 
                            className="eye-icon"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                        >
                            <EyeIcon isVisible={showConfirmPass} />
                        </button>
                    </div>

                    <button 
                        type="submit" 
                        className="reset-btn"
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? "Updating..." : "Change Password"}
                    </button>
                </form>

                {message && (
                    <div className={`message-box ${message.includes('Success') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;