const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, isStaffOrAdmin } = require('../middlewares/authMiddleware');

// --- ROUTE DÀNH CHO KHÁCH HÀNG ---
// Thực hiện đặt hàng (Khách vãng lai có thể đặt)
router.post('/', orderController.placeOrder);

// Xem lịch sử mua hàng (Chỉ dành cho tài khoản đã đăng nhập)
router.get('/me', verifyToken, orderController.getMyOrders);

// --- ROUTE DÀNH CHO ADMIN & NHÂN VIÊN ---
// Xem toàn bộ đơn hàng của hệ thống và Cập nhật trạng thái
router.get('/admin', verifyToken, isStaffOrAdmin, orderController.getAllOrdersAdmin);
router.put('/admin/:id/status', verifyToken, isStaffOrAdmin, orderController.updateOrderStatusAdmin);

module.exports = router;