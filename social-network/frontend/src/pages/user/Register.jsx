import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../../api/authApi';
import './Register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Confirm password does not match the new password.");
            return;
        }

        if (password.length < 8) {
            setError("The password length must be 8 characters or more.");
            return;
        }

        setIsLoading(true);

        try {
            await authApi.register({ username, email, password });
            navigate('/verify-email', { state: { email: email } });
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || '“Registration failed!';
            setError(`False ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-container">
                <div className="threads-logo-bg"></div>

                <h2>Join Universe</h2>
                <p className="sub-text">Create your identity today.</p>

                <form onSubmit={handleSubmit}>
                    <input 
                        className="register-input" 
                        type="text" 
                        placeholder="Username" 
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
                    <input 
                        className="register-input"
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    
                    <input 
                        className="register-input"
                        type="password" 
                        placeholder="Confirm Password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                    />

                    {error && (
                        <div style={{ color: '#ff4d4d', fontSize: '14px', textAlign: 'left', margin: '5px 0' }}>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="register-btn" 
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? "Signing Up..." : "Sign Up"}
                    </button>
                </form>

                <div className="auth-links">
                    <p style={{color: '#777'}}>
                        Already have an account? <Link to="/login" style={{marginLeft: '5px'}}>Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;