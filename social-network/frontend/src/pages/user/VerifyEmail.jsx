import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import authApi from "../../api/authApi";
import "./VerifyEmail.css"; 

const VerifyEmail = () => {
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate("/register");
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            await authApi.verifyEmail({ email, code });
            setMessage(" Account verified! Redirecting...");
            
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Verification failed";
            setMessage(` ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="verify-wrapper">
            <div className="verify-container">
                {/* Logo */}
                <div className="threads-logo-bg"></div>
                
                {/* 👇 ĐỒNG BỘ: Tiêu đề H1 là Universe giống trang Register */}
                <h1>Verify Account</h1>
                <p className="sub-text">
                    Enter the code sent to <br/>
                    <strong style={{color: '#fff'}}>{email}</strong>
                </p>

                <form onSubmit={handleSubmit}>
                    <input 
                        className="verify-input-code" 
                        type="text" 
                        placeholder="000000" 
                        value={code} 
                        onChange={(e) => setCode(e.target.value)} 
                        maxLength="6"
                        required 
                    />
                    <button 
                        type="submit" 
                        className="verify-btn" 
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? "Verifying..." : "Verify Code"}
                    </button>
                </form>

                {message && (
                    <div className={`message-box ${message.includes('') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}
                
                 <div className="auth-links">
                    <Link to="/register">← Back to Register</Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;