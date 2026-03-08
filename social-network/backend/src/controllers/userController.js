const User = require('../models/User');
const { createNotification } = require('./notificationController');

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
            res.status(404).json({ message: 'Người dùng không tồn tại hoặc chưa xác thực' });
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
            
            // Cập nhật giao diện (background)
            if (req.body.background) user.background = req.body.background;
            if (req.body.type) user.backgroundType = req.body.type;

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
                background: updatedUser.background,
                backgroundType: updatedUser.backgroundType,
                token: req.body.token,
            });
        } else {
            res.status(404).json({ message: 'Người dùng không tồn tại' });
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

            // Tối ưu: Dùng $addToSet để tránh trùng lặp và giảm câu lệnh kiểm tra
            const result = await userToFollow.updateOne({ $addToSet: { followers: req.user._id } });

            // Chỉ khi follow thành công (có user được thêm vào) thì mới thực hiện các bước sau
            if (result.modifiedCount > 0) {
                await User.updateOne({ _id: req.user._id }, { $addToSet: { following: req.params.id } });
                await createNotification({
                    from: req.user._id,
                    to: userToFollow._id,
                    type: 'follow',
                });
                res.status(200).json({ message: 'Đã theo dõi người dùng' });
            } else {
                res.status(403).json({ message: 'Bạn đã theo dõi người dùng này' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(403).json({ message: 'Bạn không thể tự theo dõi chính mình' });
    }
};

// @desc    Unfollow a user
// @route   PUT /api/users/:id/unfollow
const unfollowUser = async (req, res) => {
    if (req.user._id.toString() !== req.params.id) {
        try {
            // Tối ưu: Dùng $pull trực tiếp, nó sẽ không báo lỗi nếu user không tồn tại trong list
            await User.updateOne({ _id: req.params.id }, { $pull: { followers: req.user._id } });
            await User.updateOne({ _id: req.user._id }, { $pull: { following: req.params.id } });
            res.status(200).json({ message: 'Đã hủy theo dõi người dùng' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(403).json({ message: 'Bạn không thể tự hủy theo dõi chính mình' });
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
 * @desc    Get users that current user can chat with (Following or Followers)
 * @route   GET /api/users/chat-available
 * @access  Private
 */
const getChatAvailableUsers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);

        if (!currentUser) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // Lấy danh sách:
        // 1. Người mình đang follow (để mình nhắn tin cho họ)
        // 2. Người đang follow mình (để hiển thị tin nhắn chờ từ họ)
        const users = await User.find({
            _id: {
                $ne: currentUser._id,           // không lấy chính mình
            },
            $or: [
                { _id: { $in: currentUser.following } }, // Mình follow họ
                { _id: { $in: currentUser.followers } }  // Họ follow mình
            ],
            isVerified: true,
        }).select("_id username profilePicture");

        // Phân loại:
        // - Inbox: Người mình ĐANG follow (bạn bè, người quen)
        // - Requests: Người follow mình nhưng mình KHÔNG follow lại (tin nhắn chờ)
        const followingSet = new Set(currentUser.following.map(id => id.toString()));
        
        const inbox = [];
        const requests = [];

        users.forEach(user => {
            if (followingSet.has(user._id.toString())) inbox.push(user);
            else requests.push(user);
        });

        res.status(200).json({ inbox, requests });
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


// @desc    Get user followers list
// @route   GET /api/users/:id/followers
const getUserFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("followers", "_id username profilePicture");
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        res.status(200).json(user.followers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user following list
// @route   GET /api/users/:id/following
const getUserFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("following", "_id username profilePicture");
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        res.status(200).json(user.following);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, updateUserProfile, followUser, unfollowUser, getAllUsers, getChatAvailableUsers, searchUsers, getUserFollowers, getUserFollowing };