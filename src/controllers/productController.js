const Product = require('../models/productModel');

const productController = {
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.getAllProducts();
            res.status(200).json({ success: true, count: products.length, data: products });
        } catch (error) {
            console.error('Lỗi khi truy vấn sản phẩm:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

createProduct: async (req, res) => {
        try {
            // Yêu cầu nhập ít nhất tên và giá
            if (!req.body.name || !req.body.price) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (name, price)' });
            }

            // Xử lý hình ảnh: Ưu tiên file tải lên, nếu không có thì lấy link URL (nếu Frontend vẫn gửi), hoặc để null
            let imageUrl = req.body.image || null; 
            if (req.file) {
                imageUrl = `/uploads/${req.file.filename}`;
            }

            // Gộp dữ liệu text từ form và đường dẫn ảnh mới
            const productData = {
                ...req.body,
                image: imageUrl
            };

            // Truyền productData (đã có chứa ảnh) vào Model như cũ
            const newProduct = await Product.createProduct(productData);
            res.status(201).json({ success: true, data: newProduct });
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },
    
    updateProduct: async (req, res) => {
        try {
            const updatedProduct = await Product.updateProduct(req.params.id, req.body);
            if (!updatedProduct) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }
            res.status(200).json({ success: true, data: updatedProduct });
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const hiddenProduct = await Product.hideProduct(req.params.id);
            if (!hiddenProduct) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }
            res.status(200).json({ success: true, message: 'Đã ẩn sản phẩm thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    getProductById: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await Product.getProductById(id);
            
            if (!product) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }
            
            res.json({ success: true, data: product });
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        }
    }
};



module.exports = productController;