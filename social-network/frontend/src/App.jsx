import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

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


// Component bảo vệ Route
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
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/resetpassword/:token" element={<ResetPassword />} />

                    <Route path="/login-success/:token" element={<LoginSuccess />} />

                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Home />
                            </PrivateRoute>
                        }
                    />

                    <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/me" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                    <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                    <Route path="/login-success/:token" element={<LoginSuccess />} />

                    {/* Các route cần đăng nhập */}
                    <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/me" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    
                    {/* Route Search */}
                    <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />

                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;