const pool = require('../config/db');

const Order = {
    // Tạo bản ghi đơn hàng mới
    createOrder: async (userId, totalAmount, paymentMethod, shippingAddress) => {
        const query = `
            INSERT INTO orders (user_id, total_amount, payment_method, shipping_address)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const values = [userId, totalAmount, paymentMethod, shippingAddress];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Lưu chi tiết từng sản phẩm trong đơn hàng
    addOrderItem: async (orderId, productId, quantity, priceAtPurchase) => {
        const query = `
            INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
            VALUES ($1, $2, $3, $4);
        `;
        await pool.query(query, [orderId, productId, quantity, priceAtPurchase]);
    },

    // Xóa toàn bộ sản phẩm trong giỏ sau khi đặt hàng thành công
    clearCart: async (cartId) => {
        const query = 'DELETE FROM cart_items WHERE cart_id = $1';
        await pool.query(query, [cartId]);
    },

    // Lấy danh sách đơn hàng của một người dùng cụ thể
    getMyOrders: async (userId) => {
        const query = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC';
        const { rows } = await pool.query(query, [userId]);
        return rows;
    },

    // Lấy chi tiết các sản phẩm bên trong một đơn hàng
    getOrderDetails: async (orderId) => {
        const query = `
            SELECT oi.id AS order_item_id, oi.product_id, p.name, p.image_url, oi.quantity, oi.price_at_purchase
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
        `;
        const { rows } = await pool.query(query, [orderId]);
        return rows;
    },

    // Lấy tất cả đơn hàng trên hệ thống (Dành cho Admin)
    getAllOrdersAdmin: async () => {
        const query = 'SELECT * FROM orders ORDER BY created_at DESC';
        const { rows } = await pool.query(query);
        return rows;
    },

    // Cập nhật trạng thái đơn hàng (Dành cho Admin)
    updateOrderStatus: async (orderId, status) => {
        const query = 'UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *';
        const { rows } = await pool.query(query, [status, orderId]);
        return rows[0];
    }
    
};

module.exports = Order;