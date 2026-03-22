const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { verifyToken, isStaffOrAdmin } = require('../middlewares/authMiddleware');

// Khách hàng có thể xem danh mục
router.get('/', getCategories);

// Chỉ Admin/Staff mới được thao tác thay đổi
router.post('/', verifyToken, isStaffOrAdmin, createCategory);
router.put('/:id', verifyToken, isStaffOrAdmin, updateCategory);
router.delete('/:id', verifyToken, isStaffOrAdmin, deleteCategory);

module.exports = router;