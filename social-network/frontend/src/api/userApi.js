import axiosClient from './axiosClient';

const userApi = {
    getUser(id) {
        return axiosClient.get(`/users/${id}`);
    },
    updateUser(id, data) {
        return axiosClient.put(`/users/${id}`, data);
    },
    follow(id) {
        return axiosClient.put(`/users/${id}/follow`);
    },
    unfollow(id) {
        return axiosClient.put(`/users/${id}/unfollow`);
    }
};

export default userApi;