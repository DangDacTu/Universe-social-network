const User = require('../models/User');
const Post = require('../models/Post');
const { createNotification } = require('./notificationController');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

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
            user.username = req.body.username || user.username;
            user.bio = req.body.bio || user.bio;
            user.profilePicture = req.body.profilePicture || user.profilePicture;
            user.gender = req.body.gender || user.gender;
            
            if (req.body.background) user.background = req.body.background;
            if (req.body.type) user.backgroundType = req.body.type;

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
                savedPosts: updatedUser.savedPosts,
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

            const result = await userToFollow.updateOne({ $addToSet: { followers: req.user._id } });

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

        const users = await User.find({
            _id: {
                $ne: currentUser._id,
            },
            $or: [
                { _id: { $in: currentUser.following } },
                { _id: { $in: currentUser.followers } }
            ],
            isVerified: true,
        }).select("_id username profilePicture");
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

// @desc    Đăng lại bài viết (Repost)
// @route   POST /api/users/repost/:id (ID của bài viết gốc)
const repostPost = async (req, res) => {
    try {
        const originalPostId = req.params.id;
        
        const originalPost = await Post.findById(originalPostId);
        if (!originalPost) {
            return res.status(404).json({ message: "Bài viết không tồn tại" });
        }

        const newRepost = new Post({
            author: req.user._id,
            repostData: originalPostId,
            content: "",
            media: []
        });
        await newRepost.save();
        
        await newRepost.populate("author", "username profilePicture");
        await newRepost.populate({
            path: "repostData",
            populate: { path: "author", select: "username profilePicture" }
        });

        res.status(201).json(newRepost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy danh sách bài đăng lại của user
// @route   GET /api/users/:id/reposts
const getUserReposts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.id, repostData: { $ne: null } })
            .sort({ createdAt: -1 })
            .populate("author", "username profilePicture")
            .populate({
                path: "repostData",
                populate: { path: "author", select: "username profilePicture" }
            });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lưu hoặc Bỏ lưu bài viết
// @route   PUT /api/users/save/:id
const toggleSavePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: "User not found" });

        const index = user.savedPosts.indexOf(postId);

        if (index !== -1) {
            user.savedPosts.splice(index, 1);
            await user.save();
            res.json({ message: "Đã bỏ lưu bài viết", savedPosts: user.savedPosts, isSaved: false });
        } else {
            user.savedPosts.push(postId);
            await user.save();
            res.json({ message: "Đã lưu bài viết", savedPosts: user.savedPosts, isSaved: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy danh sách bài viết đã lưu
// @route   GET /api/users/saved-posts
const getSavedPosts = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'savedPosts',
                populate: { path: 'author', select: 'username profilePicture' }
            });

        const validPosts = user.savedPosts.filter(post => post !== null);
        
        res.json(validPosts.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getUserProfile, 
    updateUserProfile, 
    followUser, 
    unfollowUser, 
    getAllUsers, 
    getChatAvailableUsers, 
    searchUsers, 
    getUserFollowers, 
    getUserFollowing,
    repostPost,
    getUserReposts,
    toggleSavePost,
    getSavedPosts
};