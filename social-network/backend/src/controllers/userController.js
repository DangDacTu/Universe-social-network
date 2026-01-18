const User = require('../models/User');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
const getUserProfile = async (req, res) => {
    try {
        // Tìm user, loại bỏ password ra khỏi kết quả trả về
        const user = await User.findById(req.params.id).select('-password');

        // (Tùy chọn) Nếu bạn muốn chặn không cho xem profile của người chưa xác thực luôn:
        if (user && user.isVerified) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found or not verified' });
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
            // giới tính   
            user.gender = req.body.gender || user.gender;

            // Nếu đổi mật khẩu
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                bio: updatedUser.bio,
                profilePicture: updatedUser.profilePicture,
                token: req.body.token,
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

// @desc    Get All Users (For Home/Suggestions)
// @route   GET /api/users
const getAllUsers = async (req, res) => {
    try {
        // Thêm điều kiện { isVerified: true } để CHỈ lấy những người đã xác thực
        const users = await User.find({ isVerified: true })
            .limit(20)
            .select("_id username profilePicture email");

        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
};

/**
 * @desc    Get users that current user can chat with (mutual follow)
 * @route   GET /api/users/chat-available
 * @access  Private
 */
const getChatAvailableUsers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const users = await User.find({
            _id: {
                $ne: currentUser._id,           // không lấy chính mình
                $in: currentUser.following      // mình follow họ
            },
            followers: {
                $in: [currentUser._id]          // họ follow lại mình
            },
            isVerified: true,
        }).select("_id username profilePicture");

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tìm kiếm người dùng CHỈ THEO USERNAME
// @route   GET /api/users/search?q=keyword
const searchUsers = async (req, res) => {
    try {
        const keyword = req.query.q;

        if (!keyword) {
            return res.status(400).json({ message: "Vui lòng nhập từ khóa" });
        }

        // --- SỬA Ở ĐÂY ---
        // Chỉ tìm theo trường username (bỏ dòng email đi)
        const users = await User.find({
            username: { $regex: keyword, $options: "i" } 
        })
        .select("username email profilePicture _id") 
        .limit(10);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { getUserProfile, updateUserProfile, followUser, unfollowUser, getAllUsers, getChatAvailableUsers, };
