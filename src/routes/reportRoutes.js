const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorizeAdmin } = require('../config/authMiddleware');

// Chỉ Admin/Staff mới được truy cập dữ liệu thống kê
router.get('/', protect, authorizeAdmin, reportController.getDashboardStats);

module.exports = router;