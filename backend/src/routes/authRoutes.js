const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Không sử dụng middleware protect ở đây vì người dùng chưa có tài khoản/chưa đăng nhập
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;