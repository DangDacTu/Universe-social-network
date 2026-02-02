import axiosClient from './axiosClient';

const authApi = {
    register(data) {
        return axiosClient.post('/auth/register', data);
    },
    verifyEmail(data) {
        // Gửi { email, code }
        return axiosClient.post('/auth/verify-email', data);
    },
    login(data) {
        return axiosClient.post('/auth/login', data);
    },
    forgotPassword(email) {
        return axiosClient.post('/auth/forgotpassword', { email });
    },
    resetPassword(token, password) {
        return axiosClient.put(`/auth/resetpassword/${token}`, { password });
    }
};

export default authApi;