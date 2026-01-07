const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(express.json()); // Parse JSON body

// CẤU HÌNH CORS CHO APP (Quan trọng)
// Phải cho phép cả Localhost (để code máy nhà) và Vercel (để chạy online)
app.use(cors({
    origin: [
        "http://localhost:5173",             // Cho phép máy local
        "https://universe-social-network.vercel.app" //Cho phép Vercel
    ],
    credentials: true // Cho phép gửi cookie/token xác thực
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

module.exports = app;