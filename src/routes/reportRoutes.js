const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Khai báo API lấy báo cáo doanh thu
router.get('/revenue', reportController.getRevenueReport);

module.exports = router;