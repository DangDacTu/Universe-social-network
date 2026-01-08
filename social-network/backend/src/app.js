const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const settingsRoutes = require('./routes/settings');

const app = express();

// Middleware
app.use(express.json()); // Parse JSON body
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);

module.exports = app;