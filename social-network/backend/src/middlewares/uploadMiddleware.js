const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const dotenv = require("dotenv");

dotenv.config();

// 1. Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cấu hình Storage (ĐÃ SỬA LỖI)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Tự động xác định đây là video hay ảnh dựa trên mimetype
    // Ví dụ: image/png -> isVideo = false; video/mp4 -> isVideo = true
    // Lưu ý: Cloudinary xử lý Audio (mp3, wav) chung nhóm với Video (resource_type: "video")
    const isRaw = file.mimetype.startsWith("video") || file.mimetype.startsWith("audio");
    
    return {
      folder: "universe_social_network", // Tên thư mục trên Cloudinary
      
      // 🔥 QUAN TRỌNG 1: Thay vì để "auto", ta chỉ định rõ ràng
      resource_type: isRaw ? "video" : "image",
      
      // 🔥 QUAN TRỌNG 2: Bỏ 'allowed_formats' mảng cứng, thay bằng lấy đuôi file gốc
      // Điều này giúp tránh lỗi Cloudinary từ chối file mp4 hợp lệ
      format: file.mimetype.split("/")[1], 
      
      public_id: `post-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    };
  },
});

// 3. Bộ lọc file (Lớp bảo vệ đầu tiên)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image") ||
    file.mimetype.startsWith("video") ||
    file.mimetype.startsWith("audio") // 🔥 Cho phép thêm Audio
  ) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép ảnh, video hoặc âm thanh"), false);
  }
};

// 4. Xuất Multer
module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // Tăng giới hạn lên 100MB cho video
});