const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function (passport) {

    console.log("Check Client ID:", process.env.GOOGLE_CLIENT_ID);
    
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "/api/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                // Lấy thông tin từ Google
                const newUser = {
                    googleId: profile.id,
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    profilePicture: profile.photos[0].value,
                };

                try {
                    // Kiểm tra user có tồn tại chưa
                    let user = await User.findOne({ email: newUser.email });

                    if (user) {
                        // Nếu user đã tồn tại
                        if (!user.googleId) {
                            // Cập nhật googleId nếu trước đó họ đk bằng email thường
                            user.googleId = newUser.googleId;
                            await user.save();
                        }
                        done(null, user);
                    } else {
                        // Nếu chưa có thì tạo mới
                        user = await User.create(newUser);
                        done(null, user);
                    }
                } catch (err) {
                    console.error(err);
                    done(err, null);
                }
            }
        )
    );
};