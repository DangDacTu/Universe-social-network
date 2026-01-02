const express = require('express');
const router = express.Router();
const passport = require('passport');
const { registerUser, loginUser, forgotPassword, resetPassword } = require('../controllers/authController');

const generateToken = require('../utils/generateToken');

// --- Các route ---

router.post('/register', registerUser);
router.post('/login', loginUser);

// 1. Gọi Google Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Google trả về kết quả (Callback)
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // Tạo token cho user
        const token = generateToken(req.user._id);
        
        // Chuyển hướng về Frontend kèm theo Token
        res.redirect(`http://localhost:5173/login-success/${token}`);
    }
);

// 3. Quên mật khẩu & Reset
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;