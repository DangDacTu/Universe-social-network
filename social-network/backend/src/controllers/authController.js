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
            return res.status(400).json({ message: 'Người dùng đã tồn tại' });
        }

        // 1. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //TẠO AVATAR ROBOT VỚI ROBOHASH
        // Mỗi username sẽ tạo ra một con robot độc nhất
        // Thêm ?set=set2 nếu muốn quái vật, ?set=set4 nếu muốn mèo
        const defaultAvatar = `https://robohash.org/${username}?set=set2`;
        
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
                <h1>Chào mừng đến với Universe!</h1>
                <p>Cảm ơn bạn đã đăng ký. Vui lòng sử dụng mã bên dưới để xác thực tài khoản:</p>
                <h2 style="color: #000; letter-spacing: 5px;">${verificationCode}</h2>
                <p>Mã này sẽ hết hạn sau 1 giờ.</p>
            `;

            try {
                await sendEmail({
                    to: user.email,
                    subject: "Universe - Xác thực tài khoản của bạn",
                    text: message,
                });

                res.status(201).json({
                    success: true,
                    message: "Đăng ký thành công! Vui lòng kiểm tra email.",
                    email: user.email 
                });
            } catch (error) {
                // Nếu gửi mail lỗi, có thể cân nhắc xóa user
                return res.status(500).json({ message: "Tạo user thành công nhưng gửi email xác thực thất bại." });
            }
        } else {
            res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ' });
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
            return res.status(400).json({ message: "Mã xác thực không hợp lệ hoặc đã hết hạn" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Xác thực email thành công!" });
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
                    message: 'Vui lòng xác thực email trước!', 
                    needVerification: true, 
                    email: user.email 
                });
            }

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture, // Frontend sẽ hiển thị Robot từ link này
                background: user.background,
                backgroundType: user.backgroundType,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
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
        if (!user) return res.status(404).json({ message: "Email không tồn tại" });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 
        await user.save();

        const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;
        const message = `<p>Nhấn vào đây để đặt lại mật khẩu: <a href="${resetUrl}">${resetUrl}</a></p>`;

        try {
            await sendEmail({ to: user.email, subject: "Đặt lại mật khẩu", text: message });
            res.status(200).json({ success: true, data: "Đã gửi email" });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: "Không thể gửi email" });
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

        if (!user) return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Cập nhật mật khẩu thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, verifyEmail };