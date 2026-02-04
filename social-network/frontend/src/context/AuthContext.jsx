import { createContext, useState, useEffect, useContext } from 'react';
import authApi from '../api/authApi';
import settingsApi from '../api/settingApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Khi đã có user, tải cài đặt giao diện (nền) từ server để áp dụng ngay
    useEffect(() => {
        if (!user) return;
        settingsApi.getSettings()
            .then((res) => {
                const { background, backgroundType } = res.data || {};
                if (background != null && background !== '') {
                    setUser((prev) => prev ? { ...prev, background, backgroundType: backgroundType || 'color' } : prev);
                    const u = localStorage.getItem('user');
                    if (u) {
                        const parsed = JSON.parse(u);
                        localStorage.setItem('user', JSON.stringify({ ...parsed, background, backgroundType: backgroundType || 'color' }));
                    }
                }
            })
            .catch(() => {});
    }, [user?._id]);

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

    const updateUser = (payload) => {
        setUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev, ...payload };
            localStorage.setItem('user', JSON.stringify(next));
            return next;
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