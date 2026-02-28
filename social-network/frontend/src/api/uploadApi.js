import axiosClient from "./axiosClient";

const uploadApi = {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append("media", file);

    const res = await axiosClient.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const mediaUrl = res?.data?.media?.[0]?.url;
    return { data: { url: mediaUrl } };
  },
};

export default uploadApi;
