const pool = require('../config/db');

const Order = {
    // Tạo bản ghi đơn hàng mới, chi tiết sản phẩm và trừ tồn kho (Transaction)
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
                orderData.user_id || null, 
                orderData.full_name, 
                orderData.phone, 
                orderData.shipping_address, 
                orderData.notes || null, 
                orderData.payment_method, 
                orderData.total_amount
            ];
            const orderResult = await client.query(orderQuery, orderValues);
            const orderId = orderResult.rows[0].id;

            // 2. Xử lý từng sản phẩm: Thêm vào order_items VÀ Trừ kho (FIFO)
            const itemQuery = `
                INSERT INTO order_items (order_id, product_id, quantity, price, price_at_purchase)
                VALUES ($1, $2, $3, $4, $4);
            `;

            for (let item of items) {
                // A. Lưu chi tiết đơn hàng
                await client.query(itemQuery, [orderId, item.product_id, item.quantity, item.price]);

                // B. Trừ tồn kho theo cơ chế FIFO và Ghi log xuất kho
            let remainingToDeduct = item.quantity;

            const batchQuery = `
                SELECT id, quantity, warehouse_id 
                FROM inventory_batches 
                WHERE product_id = $1 
                  AND quantity > 0 
                  AND expiration_date > CURRENT_DATE
                ORDER BY expiration_date ASC 
                FOR UPDATE;
            `;
            const batchResult = await client.query(batchQuery, [item.product_id]);
            const batches = batchResult.rows;

            for (let batch of batches) {
                if (remainingToDeduct === 0) break;

                let deductAmount = 0;
                if (batch.quantity >= remainingToDeduct) {
                    deductAmount = remainingToDeduct;
                    remainingToDeduct = 0;
                } else {
                    deductAmount = batch.quantity;
                    remainingToDeduct -= batch.quantity;
                }

                // Cập nhật lại số lượng của lô hàng đó
                await client.query(
                    `UPDATE inventory_batches SET quantity = quantity - $1 WHERE id = $2`,
                    [deductAmount, batch.id]
                );

                // GHI LOG XUẤT KHO VÀO BẢNG inventory_transactions (Loại: 'export')
                await client.query(
                    `INSERT INTO inventory_transactions (product_id, batch_id, warehouse_id, transaction_type, quantity, note, created_by)
                     VALUES ($1, $2, $3, 'export', $4, $5, $6)`,
                    [
                        item.product_id, 
                        batch.id, 
                        batch.warehouse_id, 
                        deductAmount, 
                        `Xuất kho bán hàng - Đơn ĐH #${orderId}`, 
                        orderData.user_id || null // Lưu ID người mua (nếu đã đăng nhập)
                    ]
                );
            }

            // C. Kiểm tra an toàn: Nếu duyệt hết các lô mà vẫn chưa trừ đủ số lượng yêu cầu -> Kho không đủ
            if (remainingToDeduct > 0) {
                throw new Error(`INSUFFICIENT_STOCK_${item.product_id}`);
            }
            }

            await client.query('COMMIT');
            return orderId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error; // Ném lỗi ra để Controller bắt
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