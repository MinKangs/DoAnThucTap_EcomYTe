const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, authorizeAdmin } = require('../config/authMiddleware');

// Chỉ Admin/Staff đã đăng nhập mới được truy cập các Route này
router.get('/', protect, authorizeAdmin, inventoryController.getInventory);
router.post('/import', protect, authorizeAdmin, inventoryController.importBatch);

module.exports = router;