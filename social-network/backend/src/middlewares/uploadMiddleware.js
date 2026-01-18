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

// 2. Cấu hình Storage (Lưu lên Cloudinary)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "universe_social_network", // Tên thư mục trên Cloudinary
      resource_type: "auto", // QUAN TRỌNG: Để nó tự nhận diện là 'image' hay 'video'
      allowed_formats: ["jpg", "png", "jpeg", "mp4", "mov", "avi"],
      // Tạo tên file ngẫu nhiên để không trùng
      public_id: `post-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    };
  },
});

// 3. Bộ lọc file (Giữ nguyên logic của bạn)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image") ||
    file.mimetype.startsWith("video")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép ảnh hoặc video"), false);
  }
};

// 4. Xuất Multer
module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});