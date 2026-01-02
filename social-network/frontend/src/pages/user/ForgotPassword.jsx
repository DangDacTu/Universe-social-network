import { useState } from "react";
import authApi from "../../api/authApi";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authApi.forgotPassword(email);
            setMessage("Email sent! Check your inbox.");
        } catch (error) {
            setMessage("Email not found or error sending mail.");
        }
    };

    return (
        <div className="login-container">
            <h3>Forgot Password</h3>
            <p>Enter your email to reset password</p>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Enter email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <button type="submit">Send Email</button>
            </form>
            {message && <p style={{marginTop: '10px'}}>{message}</p>}
            <div style={{marginTop: '10px'}}>
                <Link to="/login">Back to Login</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;