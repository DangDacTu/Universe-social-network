const Notification = require("../models/Notification");

/**
 * Tạo thông báo (gọi từ postController / userController)
 */
const createNotification = async ({ from, to, type, post = null, commentId = null }) => {
  if (from.toString() === to.toString()) return null;
  const notif = await Notification.create({ from, to, type, post, commentId });
  return notif;
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
