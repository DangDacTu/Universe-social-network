/**
 * @description Kiểm tra 2 user có follow nhau không
 */
const User = require("../models/User");

const checkMutualFollow = async (userId, targetUserId) => {
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) return false;

    const isUserFollowing = user.following.includes(targetUserId);
    const isTargetFollowing = targetUser.following.includes(userId);

    return isUserFollowing && isTargetFollowing;
};

module.exports = checkMutualFollow;
