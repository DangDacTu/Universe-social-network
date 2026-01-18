require("dotenv").config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const settingsRoutes = require('./routes/settings');
const uploadRoutes = require('./routes/upload');

const postRoutes = require("./routes/posts");

const app = express();

// Middleware
app.use(express.json()); // Parse JSON body
<<<<<<< HEAD
// CẤU HÌNH CORS CHO APP (Quan trọng)
// Phải cho phép cả Localhost (để code máy nhà) và Vercel (để chạy online)
app.use(cors({
    origin: [
        "http://localhost:5173",             // Cho phép máy local
        "https://universe-social-network.vercel.app" //Cho phép Vercel
    ],
    credentials: true // Cho phép gửi cookie/token xác thực
}));
app.use(cors());
app.use("/uploads", express.static("uploads"));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/posts", postRoutes);
=======
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
>>>>>>> mixcode2

module.exports = app;
