import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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

    // Hàm gọi Google Login
    const handleGoogleLogin = () => {
        // Chuyển hướng trình duyệt sang Backend để bắt đầu quy trình
        window.location.href = "http://localhost:5000/api/auth/google";
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Login</button>
            </form>
            
            {/* Nút Google Login */}
            <div style={{ margin: '20px 0', textAlign: 'center' }}>
                <span>OR</span>
            </div>
            <button 
                onClick={handleGoogleLogin} 
                style={{ 
                    backgroundColor: '#DB4437', 
                    color: 'white', 
                    width: '100%', 
                    border: 'none', 
                    padding: '10px', 
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                Login with Google
            </button>

            <p style={{ marginTop: '20px' }}>Don't have an account? <Link to="/register">Register</Link></p>
            <Link to="/forgot-password" style={{display: 'block', margin: '10px 0', fontSize: '14px'}}>
                Forgot Password?
            </Link>
        </div>
    );
};

export default Login;