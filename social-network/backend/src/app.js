const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const postRoutes = require("./routes/posts");

const app = express();

// Middleware
app.use(express.json()); // Parse JSON body
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/posts", postRoutes);

module.exports = app;