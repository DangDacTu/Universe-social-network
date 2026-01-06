import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (error) {
            alert('Login failed!');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:5000/api/auth/google";
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                {/* Logo giả lập style Threads */}
                <div className="threads-logo-bg"></div>
                
                <h1>Universe</h1>
                <p className="sub-text">giúp bạn kết nối và chia sẻ với mọi người trong vũ trụ của bạn.</p>
                
                <form onSubmit={handleSubmit}>
                    <input 
                        className="login-input"
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <input 
                        className="login-input"
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    <button type="submit" className="login-btn">
                        Log in
                    </button>
                </form>
                
                <div className="divider">
                    <span>OR</span>
                </div>
                
                <button onClick={handleGoogleLogin} className="google-btn">
                    {/* Icon Google đơn giản */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#0084ffff" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#06b800ff" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#ffa600ff" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ff0000ff" />
                    </svg>
                    Continue with Google
                </button>

                <div className="auth-links">
                    <Link to="/forgot-password">Forgot password?</Link>
                    <span style={{margin: '0 5px'}}>•</span>
                    <Link to="/register">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;