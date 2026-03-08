const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorizeAdmin } = require('../config/authMiddleware');

// Route thực hiện đặt hàng
router.post('/', protect, orderController.placeOrder);
// Route xem lịch sử mua hàng
router.get('/', protect, orderController.getMyOrders);

// --- ROUTE DÀNH CHO ADMIN ---
router.get('/admin', protect, authorizeAdmin, orderController.getAllOrdersAdmin);
router.put('/admin/:id/status', protect, authorizeAdmin, orderController.updateOrderStatusAdmin);

module.exports = router;