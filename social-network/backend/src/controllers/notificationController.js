const Notification = require("../models/Notification");
const socketManager = require("../sockets/socket");

/**
 * Tạo thông báo (gọi từ postController / userController)
 */
const createNotification = async ({ from, to, type, post = null, commentId = null }) => {
  if (from.toString() === to.toString()) return null;
  try {
    const notif = await Notification.create({ from, to, type, post, commentId });

    // GỬI THÔNG BÁO REAL-TIME
    const receiver = socketManager.getUser(to.toString());
    if (receiver) {
      const io = socketManager.getIO();
      // Lấy thông tin chi tiết của thông báo để gửi đi
      const populatedNotif = await Notification.findById(notif._id)
        .populate("from", "username profilePicture")
        .populate("post", "content media") // 🔥 THÊM DÒNG NÀY
        .lean();
        
      io.to(receiver.socketId).emit("new-notification", populatedNotif);
    }
    return notif;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/**
 * Lấy danh sách thông báo của user hiện tại (kiểu Instagram)
 * @route GET /api/notifications
 */
const getMyNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ to: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("from", "username profilePicture")
      .populate("post", "content media")
      .lean();

    const unreadCount = await Notification.countDocuments({
      to: req.user.id,
      read: false,
    });

    res.json({ list, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Đánh dấu đã đọc (một thông báo hoặc tất cả)
 * @route PATCH /api/notifications/read
 * Body: { id?: string } — nếu có id thì đọc 1, không thì đọc tất cả
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.body;
    const query = { to: req.user.id };
    if (id) query._id = id;
    await Notification.updateMany(query, { $set: { read: true } });
    const unreadCount = await Notification.countDocuments({
      to: req.user.id,
      read: false,
    });
    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
};