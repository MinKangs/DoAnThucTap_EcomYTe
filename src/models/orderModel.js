const pool = require('../config/db');

const Order = {
    // Tạo bản ghi đơn hàng mới và chi tiết sản phẩm (Transaction)
    createOrder: async (orderData, items) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // 1. Thêm thông tin vào bảng orders
            const orderQuery = `
                INSERT INTO orders (user_id, full_name, phone, shipping_address, notes, payment_method, total_amount, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
                RETURNING id;
            `;
            const orderValues = [
                orderData.user_id || null, // Nếu có user_id thì lưu, không thì lưu null (khách vãng lai)
                orderData.full_name, 
                orderData.phone, 
                orderData.shipping_address, 
                orderData.notes || null, 
                orderData.payment_method, 
                orderData.total_amount
            ];
            const orderResult = await client.query(orderQuery, orderValues);
            const orderId = orderResult.rows[0].id;

            // 2. Thêm từng sản phẩm vào bảng order_items
            const itemQuery = `
                INSERT INTO order_items (order_id, product_id, quantity, price, price_at_purchase)
                VALUES ($1, $2, $3, $4, $4);
            `;
            for (let item of items) {
                await client.query(itemQuery, [orderId, item.product_id, item.quantity, item.price]);
            }

            await client.query('COMMIT');
            return orderId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
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
    updateOrderStatus: async (id, status) => {
        const query = `
            UPDATE orders 
            SET status = $1 
            WHERE id = $2 
            RETURNING *;
        `;
        const result = await pool.query(query, [status, id]);
        return result.rows[0];
    }
};

module.exports = Order;