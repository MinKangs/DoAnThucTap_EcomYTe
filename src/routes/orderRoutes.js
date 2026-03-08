const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../config/authMiddleware');

// Route thực hiện đặt hàng
router.post('/', protect, orderController.placeOrder);
// Route xem lịch sử mua hàng
router.get('/', protect, orderController.getMyOrders);

module.exports = router;