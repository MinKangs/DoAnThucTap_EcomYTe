const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, isStaffOrAdmin } = require('../middlewares/authMiddleware');

// Chỉ Admin/Staff mới được truy cập dữ liệu thống kê
router.get('/', verifyToken, isStaffOrAdmin, reportController.getDashboardStats);

module.exports = router;