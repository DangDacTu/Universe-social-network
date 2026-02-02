/**
 * @file settingController.js
 * @author moi
 * @description Controller quản lý cài đặt tài khoản người dùng
 */
const Settings = require('../models/Settings');
const User = require('../models/User');
const bcrypt = require('bcrypt');

/**
 * Lấy cài đặt của user hiện tại
 * @route GET /api/settings
 */
const getUserSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne({ userId: req.user.id });

        // Nếu chưa có cài đặt, tạo mặc định
        if (!settings) {
            const newSettings = new Settings({ userId: req.user.id });
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
        const updateUserSettings = await Settings.findOneAndUpdate(
            { userId: req.user.id },
            req.body,
            { new: true, upsert: true } // Tạo mới nếu chưa có
        );
        res.json(updateUserSettings);
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
        const user = await User.findById(req.user.id);
        const isValidPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Old password incorrect' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserSettings,
    updateUserSettings,
    changePassword,
};