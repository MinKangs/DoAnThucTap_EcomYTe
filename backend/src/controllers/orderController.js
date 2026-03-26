const Order = require('../models/orderModel');
// Không cần require Cart Model ở đây nữa vì Frontend gửi trực tiếp mảng items

const orderController = {
    // Xử lý Khách hàng đặt hàng (Guest Checkout / LocalStorage)
    // Xử lý Khách hàng đặt hàng (Guest Checkout / LocalStorage)
    placeOrder: async (req, res) => {
        try {
            const { user_id, full_name, phone, shipping_address, notes, payment_method, total_amount, items } = req.body;

            if (!full_name || !phone || !shipping_address || !payment_method) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin giao hàng.' });
            }

            if (!items || items.length === 0) {
                return res.status(400).json({ success: false, message: 'Giỏ hàng đang trống, không thể đặt hàng.' });
            }

            const orderData = { user_id, full_name, phone, shipping_address, notes, payment_method, total_amount };
            
            // Gọi hàm tạo đơn và trừ kho
            const newOrderId = await Order.createOrder(orderData, items);

            res.status(201).json({ 
                success: true, 
                message: 'Đặt hàng thành công.', 
                data: { order_id: newOrderId }
            });
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            
            // Bắt lỗi kho không đủ hàng từ Transaction của Model
            if (error.message.startsWith('INSUFFICIENT_STOCK_')) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Rất tiếc, một số sản phẩm trong đơn hàng đã hết hàng hoặc không đủ số lượng tồn kho lúc này. Vui lòng kiểm tra lại.' 
                });
            }

            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi xử lý đơn hàng.' });
        }
    },

    // Xem lịch sử đơn hàng (Yêu cầu đăng nhập)
    getMyOrders: async (req, res) => {
        try {
            // Phần này giữ nguyên, sau này làm tính năng Auth sẽ dùng đến
            const userId = req.user?.id; 
            if(!userId) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập.' });
            
            const orders = await Order.getMyOrders(userId);

            if (orders.length === 0) {
                return res.status(200).json({ success: true, message: 'Bạn chưa có đơn hàng nào.', data: [] });
            }

            for (let i = 0; i < orders.length; i++) {
                orders[i].items = await Order.getOrderDetails(orders[i].id);
            }

            res.status(200).json({ success: true, count: orders.length, data: orders });
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // Xem tất cả đơn hàng (Admin)
    getAllOrdersAdmin: async (req, res) => {
        try {
            const orders = await Order.getAllOrdersAdmin();
            for (let i = 0; i < orders.length; i++) {
                orders[i].items = await Order.getOrderDetails(orders[i].id);
            }
            res.status(200).json({ success: true, count: orders.length, data: orders });
        } catch (error) {
            console.error('Lỗi khi lấy tất cả đơn hàng:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // Cập nhật trạng thái đơn hàng (Admin)
    updateOrderStatusAdmin: async (req, res) => {
        try {
            const { status } = req.body;
            // Gọi hàm updateOrderStatus từ Model
            const updatedOrder = await Order.updateOrderStatus(req.params.id, status);
            
            if (!updatedOrder) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
            }
            res.status(200).json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng', data: updatedOrder });
        } catch (error) {
            console.error('Lỗi cập nhật trạng thái:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = orderController;