const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

const orderController = {
    placeOrder: async (req, res) => {
        try {
            const { payment_method, shipping_address } = req.body;
            const userId = req.user.id;

            // Kiểm tra đầu vào bắt buộc
            if (!payment_method || !shipping_address) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp phương thức thanh toán và địa chỉ giao hàng.' });
            }

            // 1. Lấy thông tin giỏ hàng của người dùng
            const cart = await Cart.getCartByUserId(userId);
            if (!cart) {
                return res.status(400).json({ success: false, message: 'Giỏ hàng không tồn tại.' });
            }

            const items = await Cart.getCartItems(cart.id);
            if (items.length === 0) {
                return res.status(400).json({ success: false, message: 'Giỏ hàng đang trống, không thể đặt hàng.' });
            }

            // 2. Tính toán tổng tiền
            const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

            // 3. Khởi tạo đơn hàng vào CSDL
            const newOrder = await Order.createOrder(userId, totalAmount, payment_method, shipping_address);

            // 4. Chuyển sản phẩm từ giỏ sang chi tiết đơn hàng
            for (let item of items) {
                await Order.addOrderItem(newOrder.id, item.product_id, item.quantity, item.price);
            }

            // 5. Làm sạch giỏ hàng
            await Order.clearCart(cart.id);

            res.status(201).json({ 
                success: true, 
                message: 'Đặt hàng thành công.', 
                data: {
                    order_id: newOrder.id,
                    total_amount: totalAmount,
                    payment_method: newOrder.payment_method,
                    status: newOrder.order_status
                }
            });
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // Xem lịch sử đơn hàng
    getMyOrders: async (req, res) => {
        try {
            const userId = req.user.id;
            
            // Lấy danh sách các hóa đơn
            const orders = await Order.getMyOrders(userId);

            if (orders.length === 0) {
                return res.status(200).json({ success: true, message: 'Bạn chưa có đơn hàng nào.', data: [] });
            }

            // Gắn chi tiết sản phẩm vào từng hóa đơn
            for (let i = 0; i < orders.length; i++) {
                orders[i].items = await Order.getOrderDetails(orders[i].id);
            }

            res.status(200).json({ success: true, count: orders.length, data: orders });
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },
    
};

module.exports = orderController;