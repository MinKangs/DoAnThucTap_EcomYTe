const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Bổ sung authorizeAdmin vào đây
const { protect, authorizeAdmin } = require('../config/authMiddleware');

// Các Route không cần đăng nhập
router.post('/register', userController.register);
router.post('/login', userController.login);

// Các Route dành cho tài khoản cá nhân
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

// --- ROUTE DÀNH CHO ADMIN ---
router.get('/', protect, authorizeAdmin, userController.getAllUsersAdmin);
router.put('/:id', protect, authorizeAdmin, userController.updateUserAdmin);

module.exports = router;