const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributorController');
const { verifyToken, isStaffOrAdmin } = require('../middlewares/authMiddleware');

// Chỉ Admin/Staff mới được truy cập
router.get('/', verifyToken, isStaffOrAdmin, distributorController.getDistributors);
router.post('/', verifyToken, isStaffOrAdmin, distributorController.addDistributor);
router.put('/:id', verifyToken, isStaffOrAdmin, distributorController.editDistributor);
router.delete('/:id', verifyToken, isStaffOrAdmin, distributorController.removeDistributor);

module.exports = router;