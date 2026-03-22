const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isStaffOrAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Khách hàng vãng lai có thể xem danh sách và chi tiết sản phẩm
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Chỉ Admin và Nhân viên mới được thêm/sửa/xóa
router.post('/', verifyToken, isStaffOrAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', verifyToken, isStaffOrAdmin,upload.single('image'), productController.updateProduct);
router.delete('/:id', verifyToken, isStaffOrAdmin, productController.deleteProduct);

module.exports = router;