// const multer = require("multer");
// const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const dotenv = require("dotenv");

// dotenv.config();

// // 1. Cấu hình Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // 2. Cấu hình Storage (ĐÃ SỬA LỖI)
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req, file) => {
//     // Tự động xác định đây là video hay ảnh dựa trên mimetype
//     // Ví dụ: image/png -> isVideo = false; video/mp4 -> isVideo = true
//     const isVideo = file.mimetype.startsWith("video");
    
//     return {
//       folder: "universe_social_network", // Tên thư mục trên Cloudinary
      
//       // 🔥 QUAN TRỌNG 1: Thay vì để "auto", ta chỉ định rõ ràng
//       resource_type: isVideo ? "video" : "image",
      
//       // 🔥 QUAN TRỌNG 2: Bỏ 'allowed_formats' mảng cứng, thay bằng lấy đuôi file gốc
//       // Điều này giúp tránh lỗi Cloudinary từ chối file mp4 hợp lệ
//       format: file.mimetype.split("/")[1], 
      
//       public_id: `post-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
//     };
//   },
// });

// // 3. Bộ lọc file (Lớp bảo vệ đầu tiên)
// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype.startsWith("image") ||
//     file.mimetype.startsWith("video")
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error("Chỉ cho phép ảnh hoặc video"), false);
//   }
// };

// // 4. Xuất Multer
// module.exports = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 100 * 1024 * 1024 }, // Tăng giới hạn lên 100MB cho video
// });