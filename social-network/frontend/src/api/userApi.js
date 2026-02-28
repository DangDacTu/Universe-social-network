import axiosClient from './axiosClient';

const userApi = {
    // 1. Lay thong tin 1 user cu the (Profile)
    getUser(id) {
        return axiosClient.get(`/users/${id}`);
    },

    // 2. Lay danh sach tat ca user (cho trang Home)
    getAllUsers() {
        return axiosClient.get('/users');
    },

    // 3. Lay danh sach user co the chat (follow 2 chieu)
    getChatAvailableUsers() {
        return axiosClient.get('/users/chat-available');
    },

    // 4. Tim kiem user theo username
    search(keyword) {
        return axiosClient.get(`/users/search?q=${encodeURIComponent(keyword)}`);
    },

    // 5. Cap nhat thong tin
    updateUser(id, data) {
        return axiosClient.put(`/users/${id}`, data);
    },

    // 6. Follow
    follow(id) {
        return axiosClient.put(`/users/${id}/follow`);
    },

    // 7. Unfollow
    unfollow(id) {
        return axiosClient.put(`/users/${id}/unfollow`);
    }
};

export default userApi;
