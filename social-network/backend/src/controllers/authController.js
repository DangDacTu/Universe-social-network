const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register new user & Send Verification Email
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo mã xác thực 6 số ngẫu nhiên
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Tạo user mới (isVerified mặc định là false từ Model)
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            verificationToken: verificationCode,
            verificationTokenExpires: Date.now() + 3600000, // Mã hết hạn sau 1 giờ (1h * 60p * 60s * 1000ms)
        });

        if (user) {
            // Gửi email chứa mã
            const message = `
                <h1>Welcome to Universe</h1>
                <p>Thank you for registering. Please use the code below to verify your account:</p>
                <h2 style="color: blue;">${verificationCode}</h2>
                <p>This code will expire in 1 hour.</p>
            `;

            try {
                await sendEmail({
                    to: user.email,
                    subject: "Universe Account Verification",
                    text: message, // Hoặc html: message tùy vào hàm sendEmail của bạn hỗ trợ gì
                });

                res.status(201).json({
                    success: true,
                    message: "Registration successful! Please check your email to verify account.",
                    email: user.email // Trả về email để frontend điền sẵn vào form verify
                });
            } catch (error) {
                // Nếu gửi mail lỗi, có thể xóa user để họ đăng ký lại (tùy chọn)
                // await User.findByIdAndDelete(user._id);
                return res.status(500).json({ message: "User created but failed to send verification email." });
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Email with Code
// @route   POST /api/auth/verify-email (Cần thêm route này vào auth.js)
const verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    try {
        // Tìm user có email và mã code khớp, đồng thời mã chưa hết hạn
        const user = await User.findOne({
            email,
            verificationToken: code,
            verificationTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }

        // Kích hoạt tài khoản
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Email verified successfully! You can login now." });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        // So sánh mật khẩu
        if (user && (await bcrypt.compare(password, user.password))) {
            
            //  Kiểm tra xem đã kích hoạt chưa
            if (!user.isVerified) {
                return res.status(401).json({ 
                    message: 'Please verify your email first!', 
                    needVerification: true, // Cờ hiệu để frontend biết chuyển hướng sang trang nhập code
                    email: user.email 
                });
            }

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password - Gửi email
// @route   POST /api/auth/forgotpassword
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email not found" });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 

        await user.save();

        const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;

        const message = `
            <h1>Password Reset Request</h1>
            <p>You have requested to reset your password.</p>
            <p>Click the link below to verify:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: "Universe Password Reset",
                text: message,
            });
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

        if (!user) {
            return res.status(400).json({ message: "Invalid or Expired Token" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: "Password Updated Success" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, verifyEmail };