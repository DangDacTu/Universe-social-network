const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileType = req.file.mimetype.startsWith("image")
            ? "image"
            : req.file.mimetype.startsWith("audio")
                ? "audio"
                : "file";

        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString(
                "base64"
            )}`,
            {
                folder: "chat",
                resource_type: "auto",
            }
        );

        res.json({
            url: result.secure_url,
            public_id: result.public_id,
            type: fileType,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Upload failed" });
    }
});

module.exports = router;