import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const { token } = useParams(); // Lấy token trên URL
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authApi.resetPassword(token, password);
            alert("Password Reset Successfully!");
            navigate("/login");
        } catch (error) {
            alert("Error! Token might be expired.");
        }
    };

    return (
        <div className="login-container">
            <h3>Reset Password</h3>
            <form onSubmit={handleSubmit}>
                <input 
                    type="password" 
                    placeholder="New Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    minLength="6"
                />
                <button type="submit">Change Password</button>
            </form>
        </div>
    );
};

export default ResetPassword;