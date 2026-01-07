const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    googleId: {
        type: String,
    },
    // Reset Password Fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Email Verification Fields
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    verificationToken: { 
        type: String 
    },
    verificationTokenExpires: { 
        type: Date 
    },

    profilePicture: {
        type: String,
        default: "", 
    },
    bio: {
        type: String,
        default: "",
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isAdmin: {
        type: Boolean,
        default: false,
    },
    gender: { 
        type: String, default: "other" 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);