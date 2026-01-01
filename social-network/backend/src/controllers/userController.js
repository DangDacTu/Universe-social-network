const User = require('../models/User');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
const getUserProfile = async (req, res) => {
    try {
        // Tìm user, loại bỏ password ra khỏi kết quả trả về
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Chỉ cập nhật nếu user gửi dữ liệu mới lên, không thì giữ nguyên
            user.username = req.body.username || user.username;
            user.bio = req.body.bio || user.bio;
            user.profilePicture = req.body.profilePicture || user.profilePicture;

            // Nếu đổi mật khẩu (Logic này có thể tách riêng nếu muốn bảo mật cao hơn)
            if (req.body.password) {
                user.password = req.body.password; 
                // Middleware 'pre save' trong model User sẽ tự hash lại password nếu bạn đã setup (hoặc hash thủ công ở đây)
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                bio: updatedUser.bio,
                profilePicture: updatedUser.profilePicture,
                token: req.body.token, // Giữ lại token cũ
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Follow a user
// @route   PUT /api/users/:id/follow
const followUser = async (req, res) => {
    if (req.user._id.toString() !== req.params.id) {
        try {
            const userToFollow = await User.findById(req.params.id);
            const currentUser = await User.findById(req.user._id);

            if (!userToFollow.followers.includes(req.user._id)) {
                await userToFollow.updateOne({ $push: { followers: req.user._id } });
                await currentUser.updateOne({ $push: { following: req.params.id } });
                res.status(200).json({ message: 'User has been followed' });
            } else {
                res.status(403).json({ message: 'You already follow this user' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(403).json({ message: 'You cannot follow yourself' });
    }
};

// @desc    Unfollow a user
// @route   PUT /api/users/:id/unfollow
const unfollowUser = async (req, res) => {
    if (req.user._id.toString() !== req.params.id) {
        try {
            const userToUnfollow = await User.findById(req.params.id);
            const currentUser = await User.findById(req.user._id);

            if (userToUnfollow.followers.includes(req.user._id)) {
                await userToUnfollow.updateOne({ $pull: { followers: req.user._id } });
                await currentUser.updateOne({ $pull: { following: req.params.id } });
                res.status(200).json({ message: 'User has been unfollowed' });
            } else {
                res.status(403).json({ message: 'You dont follow this user' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(403).json({ message: 'You cannot unfollow yourself' });
    }
};

module.exports = { getUserProfile, updateUserProfile, followUser, unfollowUser };