const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributorController');
const { protect, authorizeAdmin } = require('../config/authMiddleware');

// Chỉ Admin/Staff mới được truy cập
router.get('/', protect, authorizeAdmin, distributorController.getDistributors);
router.post('/', protect, authorizeAdmin, distributorController.addDistributor);
router.put('/:id', protect, authorizeAdmin, distributorController.editDistributor);
router.delete('/:id', protect, authorizeAdmin, distributorController.removeDistributor);

module.exports = router;