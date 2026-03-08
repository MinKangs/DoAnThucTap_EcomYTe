const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../config/authMiddleware'); // Import Middleware

// Các Route không cần đăng nhập
router.post('/register', userController.register);
router.post('/login', userController.login);

// Các Route bắt buộc phải có Token hợp lệ (Đã đăng nhập)
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

module.exports = router;