const pool = require('../config/db');

const reportController = {
    getRevenueReport: async (req, res) => {
        try {
            // Nhận tham số ngày từ Frontend, mặc định lấy 30 ngày qua
            const { startDate, endDate } = req.query;
            let dateFilter = '';
            const params = [];

            if (startDate && endDate) {
                dateFilter = `AND o.created_at >= $1 AND o.created_at <= $2`;
                params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
            } else {
                dateFilter = `AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'`;
            }

            // 1. Chỉ số tổng quan (KPI)
            const summaryQuery = `
                SELECT 
                    COALESCE(SUM(o.total_amount), 0) as total_revenue,
                    COUNT(DISTINCT o.id) as total_orders,
                    COALESCE(SUM(oi.quantity), 0) as total_items_sold
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE o.status IN ('completed', 'delivered', 'da_giao') ${dateFilter}
            `;
            const summaryResult = await pool.query(summaryQuery, params);

            // 2. Doanh thu theo thời gian (Cho biểu đồ đường)
            const timelineQuery = `
                SELECT 
                    TO_CHAR(o.created_at, 'DD/MM') as date,
                    SUM(o.total_amount) as revenue
                FROM orders o
                WHERE o.status IN ('completed', 'delivered', 'da_giao') ${dateFilter}
                GROUP BY TO_CHAR(o.created_at, 'DD/MM'), DATE(o.created_at)
                ORDER BY DATE(o.created_at) ASC
            `;
            const timelineResult = await pool.query(timelineQuery, params);

            // 3. Doanh thu theo danh mục (Cho biểu đồ tròn)
            const categoryQuery = `
                SELECT 
                    c.name as category_name,
                    SUM(oi.quantity * oi.price) as revenue
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN products p ON oi.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                WHERE o.status IN ('completed', 'delivered', 'da_giao') ${dateFilter}
                GROUP BY c.id, c.name
                ORDER BY revenue DESC
            `;
            const categoryResult = await pool.query(categoryQuery, params);

            // 4. Top 10 sản phẩm bán chạy nhất
            const topProductsQuery = `
                SELECT 
                    p.id,
                    p.name,
                    SUM(oi.quantity) as total_sold,
                    SUM(oi.quantity * oi.price) as revenue
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN products p ON oi.product_id = p.id
                WHERE o.status IN ('completed', 'delivered', 'da_giao') ${dateFilter}
                GROUP BY p.id, p.name
                ORDER BY revenue DESC
                LIMIT 10
            `;
            const topProductsResult = await pool.query(topProductsQuery, params);

            res.json({
                success: true,
                data: {
                    summary: summaryResult.rows[0],
                    timeline: timelineResult.rows,
                    categories: categoryResult.rows,
                    topProducts: topProductsResult.rows
                }
            });

        } catch (error) {
            console.error('Lỗi lấy báo cáo doanh thu:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
};

module.exports = reportController;