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
            if (!req.body.name || !req.body.price) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (name, price)' });
            }

            // 1. Xử lý hình ảnh tải lên
            let imageUrl = null; 
            if (req.file) {
                imageUrl = `/uploads/${req.file.filename}`;
            }

            // 2. Gộp dữ liệu, đảm bảo key là "image_url" khớp với Model
            const productData = {
                ...req.body,
                image_url: imageUrl 
            };

            const newProduct = await Product.createProduct(productData);
            res.status(201).json({ success: true, data: newProduct });
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },
    
    updateProduct: async (req, res) => {
        try {
            // 1. Lấy thông tin sản phẩm cũ từ CSDL để kiểm tra ảnh
            const oldProduct = await Product.getProductById(req.params.id);
            if (!oldProduct) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }

            // 2. Nếu có upload file mới thì lấy link mới, nếu không thì giữ nguyên link cũ
            let imageUrl = oldProduct.image_url; 
            if (req.file) {
                imageUrl = `/uploads/${req.file.filename}`;
            }

            const productData = {
                ...req.body,
                image_url: imageUrl
            };

            const updatedProduct = await Product.updateProduct(req.params.id, productData);
            res.status(200).json({ success: true, data: updatedProduct });
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const { force } = req.query; // Nhận cờ ép buộc xóa vĩnh viễn từ Frontend
            const productId = req.params.id;

            if (force === 'true') {
                // 1. Kiểm tra an toàn: Nếu sản phẩm đã có người mua thì TUYỆT ĐỐI không cho xóa vĩnh viễn
                const hasOrders = await Product.checkProductInOrders(productId);
                if (hasOrders) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'TỪ CHỐI XÓA: Sản phẩm này đã nằm trong lịch sử đơn hàng của khách. Hãy dùng chức năng "Ẩn" để không làm hỏng dữ liệu hệ thống.' 
                    });
                }

                // 2. Nếu là dữ liệu rác (chưa ai mua), cho phép xóa sạch
                await Product.hardDeleteProduct(productId);
                return res.status(200).json({ success: true, message: 'Đã xóa vĩnh viễn dữ liệu rác.' });
            } else {
                // 3. Logic Ẩn sản phẩm (Soft Delete) mặc định
                const hiddenProduct = await Product.hideProduct(productId);
                if (!hiddenProduct) {
                    return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
                }
                return res.status(200).json({ success: true, message: 'Đã chuyển sản phẩm về trạng thái Ẩn.' });
            }
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