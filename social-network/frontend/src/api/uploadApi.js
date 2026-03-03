import axiosClient from "./axiosClient";

const uploadApi = {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append("media", file);

    // Sửa endpoint từ "/posts" thành "/upload"
    const res = await axiosClient.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Backend trả về trực tiếp { url: "...", type: "..." }
    const mediaUrl = res.data.url;
    return { data: { url: mediaUrl } };
  },
};

export default uploadApi;