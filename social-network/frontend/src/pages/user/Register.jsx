import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../../api/authApi';
import './Register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // State quản lý ẩn/hiện mật khẩu
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        if (password.length < 8) {
            setError("Mật khẩu phải có ít nhất 8 ký tự.");
            return;
        }

        setIsLoading(true);

        try {
            await authApi.register({ username, email, password });
            navigate('/verify-email', { state: { email: email } });
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || 'Đăng ký thất bại!';
            setError(`Error: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:5000/api/auth/google";
    };

    // Component Icon Mắt
    const EyeIcon = ({ isVisible }) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {isVisible ? (
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
            ) : (
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.45-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor" />
            )}
        </svg>
    );

    return (
        <div className="register-wrapper">
            <div className="register-container">
                <img src="/logo-universe1.png" alt="Universe" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "20px", display: "block", margin: "0 auto 10px auto" }} />
                <p className="sub-text">Tạo danh tính của bạn trong vũ trụ.</p>

                <form onSubmit={handleSubmit}>
                    <input 
                        className="register-input" 
                        type="text" 
                        placeholder="Tên người dùng" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                    <input 
                        className="register-input"
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    
                    {/* PASSWORD INPUT */}
                    <div className="input-wrapper">
                        <input 
                            className="register-input"
                            type={showPass ? "text" : "password"} // Toggle type
                            placeholder="Mật khẩu" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <button 
                            type="button" 
                            className="eye-icon"
                            onClick={() => setShowPass(!showPass)}
                        >
                            <EyeIcon isVisible={showPass} />
                        </button>
                    </div>

                    {/* CONFIRM PASSWORD INPUT */}
                    <div className="input-wrapper">
                        <input 
                            className="register-input"
                            type={showConfirmPass ? "text" : "password"} // Toggle type
                            placeholder="Xác nhận mật khẩu" 
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

                    {error && (
                        <div style={{ color: '#ff4d4d', fontSize: '13px', textAlign: 'left', margin: '5px 0' }}>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="register-btn" 
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                    </button>
                </form>

                <div className="divider">
                    <span>HOẶC</span>
                </div>
                
                <button onClick={handleGoogleLogin} className="google-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#0084ffff" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#06b800ff" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#ffa600ff" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ff0000ff" />
                    </svg>
                    Tiếp tục với Google
                </button>

                <div className="auth-links">
                    <p style={{color: '#fff'}}>
                        Đã có tài khoản? <Link to="/login" style={{marginLeft: '5px'}}>Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;