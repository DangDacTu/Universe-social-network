const app = require('./src/app');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const http = require('http');
const { Server } = require('socket.io');
const socketModule = require('./src/sockets/socket');
const passport = require('passport');

dotenv.config();

// Cấu hình Passport
require('./src/config/passport')(passport);

// Kết nối Database
connectDB();

// Tạo HTTP Server
const server = http.createServer(app);

// CẤU HÌNH SOCKET.IO (QUAN TRỌNG CHO CHAT/THÔNG BÁO)
const io = new Server(server, {
    cors: {
        // Cho phép cả Localhost và Vercel kết nối
        origin: [
            "http://localhost:5173",              // Máy local của bạn
            "https://universe-social-network.vercel.app", // Link Vercel (Dự kiến)
            // Khi nào có link Vercel chính thức, hãy thêm vào đây hoặc sửa dòng trên
        ],
        methods: ["GET", "POST"],
        credentials: true // Cho phép gửi cookie/auth
    }
});

// Khởi chạy module Socket
socketModule(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO ready`);
});