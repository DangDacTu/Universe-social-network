const Settings = require('../models/Settings');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Lấy cài đặt của user hiện tại
 * @route GET /api/settings
 */
const getUserSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne({ userId: req.user._id });

        // Nếu chưa có cài đặt, tạo mặc định
        if (!settings) {
            const newSettings = new Settings({ userId: req.user._id });
            return res.json(newSettings);
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
/**
 * Cập nhật tài khoản
 * @route PUT /api/settings
 */
const updateUserSettings = async (req, res) => {
    try {
        const updatedSettings = await Settings.findOneAndUpdate(
            { userId: req.user._id },
            { ...req.body, userId: req.user._id },
            { new: true, upsert: true }
        );

        if (req.body.background !== undefined) {
            await User.findByIdAndUpdate(req.user._id, {
                background: req.body.background,
                backgroundType: req.body.type || req.body.backgroundType
            });
        }

        res.json(updatedSettings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Đổi mật khẩu
 * @route PUT /api/settings/change-password
 */
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Không tìm thấy thông tin xác thực.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });
        
        if (!user.password) {
            return res.status(400).json({ message: 'Tài khoản này đăng nhập bằng Google/Facebook, không thể đổi mật khẩu.' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        
        res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Cập nhật giao diện (Background)
 * @route PUT /api/settings/appearance
 */
const updateAppearance = async (req, res) => {
    try {
        const { background, type } = req.body;
        const user = await User.findById(req.user._id);
        
        user.background = background;
        user.backgroundType = type;
        await user.save();

        res.json({ message: "Đã lưu giao diện vĩnh viễn" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserSettings,
    updateUserSettings,
    changePassword,
    updateAppearance,
};