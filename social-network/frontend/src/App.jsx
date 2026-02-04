import { useEffect } from "react"; // 🔥 Import useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from "./components/layout/MainLayout";

// Pages
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import VerifyEmail from './pages/user/VerifyEmail';
import Profile from './pages/user/Profile';
import Home from './pages/user/Home';
import LoginSuccess from './pages/user/LoginSuccess';
import ForgotPassword from './pages/user/ForgotPassword';
import ResetPassword from './pages/user/ResetPassword';
import Chat from './pages/user/Chat';
import Settings from './pages/user/Setting';
import Search from './pages/user/Search';

// Component bảo vệ Route (Yêu cầu đăng nhập)
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

// 🔥 COMPONENT CON: Chứa logic đổi nền và Routes
function AppContent() {
    const { user } = useAuth(); // Lấy user để check cài đặt background

    // 🔥 EFFECT: Tự động đổi nền khi user thay đổi cài đặt
    useEffect(() => {
        if (user?.background) {
            if (user.backgroundType === 'image') {
                // Nếu là ảnh nền
                document.body.style.backgroundImage = `url(${user.background})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundAttachment = 'fixed';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundColor = 'transparent';
            } else {
                // Nếu là màu hoặc gradient
                document.body.style.backgroundImage = 'none';
                document.body.style.background = user.background;
            }
        } else {
            // Mặc định (nếu user chưa set hoặc chưa login)
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = '#f0f2f5'; 
        }
    }, [user]);

    return (
        <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/resetpassword/:token" element={<ResetPassword />} />
            <Route path="/login-success/:token" element={<LoginSuccess />} />

            {/* ===== CHAT ROUTE (RIÊNG BIỆT) ===== */}
            <Route path="/chat" element={
                <PrivateRoute>
                    <Chat />
                </PrivateRoute>
            } />

            {/* ===== MAIN LAYOUT ROUTES ===== */}
            <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/me" element={<Profile />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
            </Route>
        </Routes>
    );
}

// 🔥 COMPONENT GỐC: Chỉ chứa Provider
function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;