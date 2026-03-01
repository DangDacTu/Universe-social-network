// File mới hoàn toàn
exports.uploadFile = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Chưa chọn file nào" });
    }
    // Middleware uploadMiddleware đã xử lý việc đẩy lên Cloudinary
    // Ta chỉ cần lấy đường dẫn trả về
    const file = req.files[0];
    
    res.json({
      url: file.path,
      type: file.mimetype.startsWith("image") ? "image" : "video",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
