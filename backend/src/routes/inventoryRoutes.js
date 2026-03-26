const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken, isStaffOrAdmin } = require('../middlewares/authMiddleware');

// Chỉ Admin/Staff đã đăng nhập mới được truy cập các Route này
router.get('/', verifyToken, isStaffOrAdmin, inventoryController.getInventory);
router.post('/import', verifyToken, isStaffOrAdmin, inventoryController.importBatch);
router.get('/transactions', verifyToken, isStaffOrAdmin, inventoryController.getTransactions);
router.put('/:id', verifyToken, isStaffOrAdmin, inventoryController.updateBatch);
router.delete('/:id', verifyToken, isStaffOrAdmin, inventoryController.deleteBatch);

module.exports = router;