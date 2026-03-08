const Cart = require('../models/cartModel');
const pool = require('../config/db');

const cartController = {
    // Xem giỏ hàng hiện tại
    getCart: async (req, res) => {
        try {
            let cart = await Cart.getCartByUserId(req.user.id);
            if (!cart) {
                cart = await Cart.createCart(req.user.id);
            }
            
            const items = await Cart.getCartItems(cart.id);
            
            // Tính tổng tiền đơn hàng
            const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

            res.status(200).json({ 
                success: true, 
                data: { cart_id: cart.id, items: items, total_amount: totalAmount } 
            });
        } catch (error) {
            console.error('Lỗi lấy giỏ hàng:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // Thêm sản phẩm vào giỏ
    addToCart: async (req, res) => {
        try {
            const { product_id, quantity } = req.body;

            // 1. Kiểm tra tồn kho của sản phẩm từ bảng inventory_batches
            const productQuery = await pool.query(`
                SELECT p.id, COALESCE(SUM(ib.quantity), 0) AS stock 
                FROM products p 
                LEFT JOIN inventory_batches ib ON p.id = ib.product_id AND ib.expiration_date > CURRENT_DATE
                WHERE p.id = $1 AND p.status = $2
                GROUP BY p.id
            `, [product_id, 'active']);

            if (productQuery.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại hoặc ngừng kinh doanh' });
            }

            // Khai báo lại biến stock lấy từ kết quả truy vấn
            const stock = parseInt(productQuery.rows[0].stock, 10);

            // Xử lý trường hợp sản phẩm hết hàng hoàn toàn
            if (stock === 0) {
                return res.status(400).json({ success: false, message: 'Sản phẩm hiện đang hết hàng.' });
            }

            // 2. Lấy hoặc tạo giỏ hàng
            let cart = await Cart.getCartByUserId(req.user.id);
            if (!cart) {
                cart = await Cart.createCart(req.user.id);
            }

            // 3. Tính toán số lượng cần thêm
            const existingItem = await Cart.checkItemInCart(cart.id, product_id);
            let newQuantity = quantity;
            if (existingItem) {
                newQuantity += existingItem.quantity;
            }

            // 4. Xử lý logic tự động điều chỉnh theo tồn kho
            let message = 'Đã cập nhật giỏ hàng thành công';
            if (newQuantity > stock) {
                newQuantity = stock;
                message = `Số lượng yêu cầu vượt quá tồn kho. Đã tự động điều chỉnh về tối đa ${stock} sản phẩm.`;
            }

            // 5. Lưu vào CSDL
            if (existingItem) {
                await Cart.updateItemQuantity(existingItem.id, newQuantity);
            } else {
                await Cart.addItem(cart.id, product_id, newQuantity);
            }

            res.status(200).json({ success: true, message: message });
        } catch (error) {
            console.error('Lỗi thêm vào giỏ:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // Xóa sản phẩm khỏi giỏ
    removeFromCart: async (req, res) => {
        try {
            await Cart.removeItem(req.params.id);
            res.status(200).json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
        } catch (error) {
            console.error('Lỗi xóa khỏi giỏ:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = cartController;