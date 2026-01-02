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

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

socketModule(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO ready`);
});