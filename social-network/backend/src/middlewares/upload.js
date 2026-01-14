const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "chat",
        resource_type: "auto", // QUAN TRỌNG (ảnh, audio, file)
    },
});

const upload = multer({ storage });

module.exports = upload;
