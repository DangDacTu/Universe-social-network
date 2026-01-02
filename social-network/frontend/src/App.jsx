import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/user/Login';
import Register from './pages/user/Register';
import Profile from './pages/user/Profile';
import Home from './pages/user/Home';
import LoginSuccess from './pages/user/LoginSuccess'; // Import trang mới

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
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;