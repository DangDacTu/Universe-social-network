import { useEffect } from "react";
import { useParams } from "react-router-dom";
import userApi from "../../api/userApi";

const LoginSuccess = () => {
    const { token } = useParams();

    useEffect(() => {
        const handleLoginSuccess = async () => {
            if (token) {
                try {
                    // Tạo object user tạm để lưu
                    const tempUser = { token: token }; 
                    localStorage.setItem("user", JSON.stringify(tempUser));
                    
                    // Redirect về trang chủ và reload để AuthContext chạy lại
                    window.location.href = "/";
                } catch (error) {
                    console.error("Login processing failed", error);
                    window.location.href = "/login";
                }
            }
        };
        handleLoginSuccess();
    }, [token]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Processing Login...</h2>
            <p>Please wait while we redirect you.</p>
        </div>
    );
};

export default LoginSuccess;