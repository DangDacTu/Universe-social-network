let users = [];

// (Khi user đăng nhập, ta lưu userId của họ kèm với socketId của phiên kết nối)
const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

// 2. Hàm xóa user khi ngắt kết nối
const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

// 3. Hàm tìm socketId của người nhận để gửi tin
const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

const socketModule = (io) => {
    io.on("connection", (socket) => {
        // console.log("A user connected.");

        // --- SỰ KIỆN 1: KHI USER VỪA VÀO APP ---
        // Client sẽ gửi sự kiện "addUser" kèm theo ID của họ
        socket.on("addUser", (userId) => {
            addUser(userId, socket.id);
            // Gửi danh sách những người đang online cho tất cả mọi người biết
            io.emit("getUsers", users);
        });

        // --- SỰ KIỆN 2: GỬI TIN NHẮN ---
        // Client gửi: người gửi, người nhận, nội dung
        socket.on("sendMessage", ({ senderId, receiverId, text }) => {
            const user = getUser(receiverId);
            
            // Nếu người nhận đang Online thì gửi ngay lập tức
            if (user) {
                io.to(user.socketId).emit("getMessage", {
                    senderId,
                    text,
                });
            } else {
                // Người nhận Offline -> Có thể xử lý thông báo sau này
                console.log(`User ${receiverId} is offline.`);
            }
        });

        // --- SỰ KIỆN 3: NGẮT KẾT NỐI (Tắt tab/Trình duyệt) ---
        socket.on("disconnect", () => {
            // console.log("A user disconnected!");
            removeUser(socket.id);
            io.emit("getUsers", users);
        });
    });
};

module.exports = socketModule;