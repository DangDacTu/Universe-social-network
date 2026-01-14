import axiosClient from './axiosClient';

const userApi = {
    // 1. Lấy thông tin 1 user cụ thể (Profile)
    getUser(id) {
        return axiosClient.get(`/users/${id}`);
    },

    // 2.Lấy danh sách tất cả user (cho trang Home)
    getAllUsers() {
        return axiosClient.get('/users');
    },

    // 3. Cập nhật thông tin
    updateUser(id, data) {
        return axiosClient.put(`/users/${id}`, data);
    },

    // 4. Follow
    follow(id) {
        return axiosClient.put(`/users/${id}/follow`);
    },

    // 5. Unfollow
    unfollow(id) {
        return axiosClient.put(`/users/${id}/unfollow`);
    },

    // 6. LẤY DANH SÁCH USER CÓ THỂ CHAT (FOLLOW LẪN NHAU)
    getChatAvailableUsers() {
        return axiosClient.get('/users/chat-available');
    },

};

export default userApi;