import axiosClient from "./axiosClient";

const messageApi = {
  getChatHistory(userId) {
    return axiosClient.get(`/messages/${userId}`);
  },
};

export default messageApi;
