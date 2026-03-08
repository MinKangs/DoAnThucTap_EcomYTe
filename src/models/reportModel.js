const pool = require('../config/db');

const Report = {
    // Thống kê tổng quan: Tổng doanh thu và tổng số đơn hàng
    getRevenueSummary: async (startDate, endDate) => {
        let query = `
            SELECT 
                COUNT(id) AS total_orders, 
                COALESCE(SUM(total_amount), 0) AS total_revenue
            FROM orders
            WHERE order_status = 'completed' OR payment_status = 'paid'
        `;
        const params = [];

        // Hỗ trợ lọc theo khoảng thời gian nếu có tham số truyền vào
        if (startDate && endDate) {
            query += ` AND created_at >= $1 AND created_at <= $2`;
            params.push(startDate, endDate);
        }

        const { rows } = await pool.query(query, params);
        return rows[0];
    },

    // Lấy top 5 sản phẩm bán chạy nhất
    getTopSellingProducts: async () => {
        const query = `
            SELECT 
                p.id, 
                p.name, 
                SUM(oi.quantity) AS total_sold
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE o.order_status = 'completed' OR o.payment_status = 'paid'
            GROUP BY p.id, p.name
            ORDER BY total_sold DESC
            LIMIT 5
        `;
        const { rows } = await pool.query(query);
        return rows;
    }
};

module.exports = Report;