import axiosClient from "./axiosClient"; // Giả sử bạn đã cấu hình axiosClient

const messageApi = {
  // Lấy lịch sử chat với 1 user cụ thể
  getChatHistory: (userId) => {
    return axiosClient.get(`/messages/${userId}`);
  },
  
  // (Tuỳ chọn) Lấy danh sách những người đã từng chat
  getConversations: () => {
    return axiosClient.get("/messages/conversations");
  }
};

export default messageApi;