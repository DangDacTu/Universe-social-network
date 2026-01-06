import { useState } from "react";
import authApi from "../../api/authApi";
import { Link } from "react-router-dom";
import "./Login.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            await authApi.forgotPassword(email);
            setMessage("Email sent! Please check your inbox.");
        } catch (error) {
            setMessage("Email not found or error sending mail.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="threads-logo-bg"></div>

                <h2>Reset Password</h2>
                <p className="sub-text">Enter your email to receive a reset link.</p>

                <form onSubmit={handleSubmit}>
                    <input 
                        className="login-input"
                        type="email" 
                        placeholder="Enter your email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    
                    <button 
                        type="submit" 
                        className="login-btn"
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                {/* Khu vực hiển thị thông báo lỗi/thành công */}
                {message && (
                    <div style={{
                        marginTop: '20px', 
                        padding: '10px',
                        borderRadius: '12px',
                        backgroundColor: message.includes('Done') ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                        color: message.includes('Done') ? '#4caf50' : '#ff4d4d',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )}

                <div className="auth-links">
                    <Link to="/login">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;