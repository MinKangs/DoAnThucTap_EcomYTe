const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorizeAdmin } = require('../config/authMiddleware');

// Route thực hiện đặt hàng
router.post('/', protect, orderController.placeOrder);
// Route xem lịch sử mua hàng
router.get('/me', protect, orderController.getMyOrders);

// --- ROUTE DÀNH CHO ADMIN ---
// Xem toàn bộ đơn hàng của hệ thống
router.get('/admin', protect, authorizeAdmin, orderController.getAllOrdersAdmin);
// Cập nhật trạng thái đơn hàng (pending, shipping, completed...)
router.put('/admin/:id/status', protect, authorizeAdmin, orderController.updateOrderStatusAdmin);

module.exports = router;