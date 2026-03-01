const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require("./routes/messages");
const postRoutes = require("./routes/posts");
const settingsRoutes = require("./routes/settings");
const notificationRoutes = require("./routes/notifications");
const uploadRoutes = require("./routes/upload");


const app = express();

// Middleware
app.use(express.json()); // Parse JSON body
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);

module.exports = app;