const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register new user & Auto-generate Robot Avatar
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 1. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //TẠO AVATAR ROBOT VỚI ROBOHASH
        // Mỗi username sẽ tạo ra một con robot độc nhất
        // Thêm ?set=set2 nếu muốn quái vật, ?set=set4 nếu muốn mèo
        const defaultAvatar = `https://robohash.org/${username}`;
        
        // 2. Tạo mã xác thực 6 số
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Tạo user mới
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            profilePicture: defaultAvatar, 
            verificationToken: verificationCode,
            verificationTokenExpires: Date.now() + 3600000, //1 giờ
            isVerified: false 
        });

        if (user) {
            // 4. Gửi email xác thực
            const message = `
                <h1>Welcome to Universe!</h1>
                <p>Thank you for registering. Please use the code below to verify your account:</p>
                <h2 style="color: #000; letter-spacing: 5px;">${verificationCode}</h2>
                <p>This code expires in 1 hour.</p>
            `;

            try {
                await sendEmail({
                    to: user.email,
                    subject: "Universe - Verify your account",
                    text: message,
                });

                res.status(201).json({
                    success: true,
                    message: "Registration successful! Please check your email.",
                    email: user.email 
                });
            } catch (error) {
                // Nếu gửi mail lỗi, có thể cân nhắc xóa user
                return res.status(500).json({ message: "User created but failed to send verification email." });
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Email
// @route   POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await User.findOne({
            email,
            verificationToken: code,
            verificationTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Email verified successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Kiểm tra kích hoạt
            if (!user.isVerified) {
                return res.status(401).json({ 
                    message: 'Please verify your email first!', 
                    needVerification: true, 
                    email: user.email 
                });
            }

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture, // Frontend sẽ hiển thị Robot từ link này
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email not found" });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 
        await user.save();

        const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientURL}/resetpassword/${resetToken}`;
        const message = `<p>Click here to reset password: <a href="${resetUrl}">${resetUrl}</a></p>`;

        try {
            await sendEmail({ to: user.email, subject: "Password Reset", text: message });
            res.status(200).json({ success: true, data: "Email Sent" });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: "Email could not be sent" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: "Invalid Token" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Password Updated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, verifyEmail };