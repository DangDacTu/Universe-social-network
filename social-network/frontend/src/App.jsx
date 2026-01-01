import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register'; // (Bạn tự tạo file Register tương tự Login nhé)
import Home from './pages/Home'; // (Placeholder cho TV2)
import Profile from './pages/Profile';

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
                    <Route path="/register" element={<Register />} /> {/* Cần tạo file này */}
                    <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/me" element={<PrivateRoute><Profile /></PrivateRoute>} /> {/* Route xem chính mình */}
                    <Route 
                        path="/" 
                        element={
                            <PrivateRoute>
                                <Home />
                            </PrivateRoute>
                        } 
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;