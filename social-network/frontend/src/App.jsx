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

// Nếu bạn cần trang Intro (từ code cũ), hãy uncomment dòng dưới
// import Intro from "./pages/user/Intro"; 

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* ===== PUBLIC ROUTES ===== */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/resetpassword/:token" element={<ResetPassword />} />
                    <Route path="/login-success/:token" element={<LoginSuccess />} />

                    {/* ===== CHAT ROUTE (RIÊNG BIỆT, KHÔNG DÙNG MAIN LAYOUT) ===== */}
                    <Route path="/chat" element={
                        <PrivateRoute>
                            <Chat />
                        </PrivateRoute>
                    } />

                    {/* ===== MAIN LAYOUT ROUTES (CÓ SIDEBAR & MODAL) ===== */}
                    <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                        <Route path="/" element={<Home />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/me" element={<Profile />} />
                        <Route path="/profile/:id" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;