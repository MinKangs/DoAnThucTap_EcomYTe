const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Import middleware xác thực của hệ thống (điều chỉnh đường dẫn thư mục nếu cần thiết)
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware'); 

// ==========================================================
// ĐƯỜNG DẪN DÀNH CHO KHÁCH HÀNG (Yêu cầu phải đăng nhập)
// ==========================================================
// Chèn verifyToken vào trước hàm xử lý của Controller
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);

// ==========================================================
// ĐƯỜNG DẪN DÀNH CHO ADMIN (Yêu cầu đăng nhập và có quyền admin)
// ==========================================================
router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.post('/', verifyToken, isAdmin, userController.createUser);
router.put('/:id', verifyToken, isAdmin, userController.updateUser);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

module.exports = router;