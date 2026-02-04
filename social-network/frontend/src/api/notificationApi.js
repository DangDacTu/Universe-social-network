import axiosClient from "./axiosClient";

const notificationApi = {
  getList() {
    return axiosClient.get("/notifications");
  },
  markAsRead(id) {
    return axiosClient.patch("/notifications/read", id != null ? { id } : {});
  },
};

export default notificationApi;
