import { createContext, useState, useEffect, useContext } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Hiệu ứng áp dụng màu nền ngay khi load trang (Chống giật màu trắng)
    useEffect(() => {
        const savedBg = localStorage.getItem('universe_bg');
        const savedType = localStorage.getItem('universe_bg_type');

        if (savedBg && savedType) {
            if (savedType === 'image') {
                document.body.style.backgroundImage = `url(${savedBg})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundAttachment = 'fixed';
            } else {
                document.body.style.background = savedBg;
            }
        }
    }, []);

    useEffect(() => {
        // Kiểm tra LocalStorage khi load lại trang
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await authApi.login({ email, password });
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    };

    const register = async (username, email, password) => {
        const { data } = await authApi.register({ username, email, password });
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    // 🔥 THÊM HÀM NÀY: Cập nhật thông tin user cục bộ (không gọi API)
    // Giúp giao diện cập nhật ngay lập tức và đồng bộ localStorage
    const updateUser = (data) => {
        setUser((prev) => {
            const updatedUser = { ...prev, ...data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;