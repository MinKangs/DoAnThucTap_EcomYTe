const pool = require('../config/db');

const dashboardController = {
    getSummary: async (req, res) => {
        try {
            const expiringQuery = `
                SELECT COUNT(*) 
                FROM inventory_batches 
                WHERE expiration_date <= CURRENT_DATE + INTERVAL '30 days'
            `;

            const pendingOrderQuery = `
                SELECT COUNT(*) 
                FROM orders 
                WHERE status = 'pending'
            `;

            const [products, categories, users, orders, inventory, expiring, pendingOrders] = await Promise.all([
                pool.query('SELECT COUNT(*) FROM products'),
                pool.query('SELECT COUNT(*) FROM categories'),
                pool.query('SELECT COUNT(*) FROM users'),
                pool.query('SELECT COUNT(*) FROM orders'),
                pool.query('SELECT SUM(quantity) as total_items FROM inventory_batches'),
                pool.query(expiringQuery),
                pool.query(pendingOrderQuery)
            ]);

            res.json({
                success: true,
                data: {
                    totalProducts: parseInt(products.rows[0].count) || 0,
                    totalCategories: parseInt(categories.rows[0].count) || 0,
                    totalUsers: parseInt(users.rows[0].count) || 0,
                    totalOrders: parseInt(orders.rows[0].count) || 0,
                    totalInventoryItems: parseInt(inventory.rows[0].total_items) || 0,
                    expiringBatches: parseInt(expiring.rows[0].count) || 0,
                    pendingOrders: parseInt(pendingOrders.rows[0].count) || 0
                }
            });
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu thống kê:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = dashboardController;