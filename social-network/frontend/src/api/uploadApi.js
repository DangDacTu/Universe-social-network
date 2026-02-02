import axiosClient from "./axiosClient";

const uploadApi = {
  // Upload file (ảnh/video/audio)
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append("file", file); 
    // Lưu ý: Tên trường "file" phải khớp với upload.single('file') bên Backend

    return axiosClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default uploadApi;