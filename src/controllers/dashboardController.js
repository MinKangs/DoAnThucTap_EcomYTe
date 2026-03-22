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

            // Đếm sản phẩm hết hàng bằng cách tính tổng lô hàng
            const outOfStockQuery = `
                SELECT COUNT(*) FROM (
                    SELECT p.id, COALESCE(SUM(ib.quantity), 0) as calculated_stock
                    FROM products p
                    LEFT JOIN inventory_batches ib 
                           ON p.id = ib.product_id AND ib.expiration_date > CURRENT_DATE
                    GROUP BY p.id
                ) AS stock_table
                WHERE calculated_stock <= 0
            `;

            // Đếm sản phẩm gần hết hàng bằng cách tính tổng lô hàng
            const lowStockQuery = `
                SELECT COUNT(*) FROM (
                    SELECT p.id, COALESCE(SUM(ib.quantity), 0) as calculated_stock
                    FROM products p
                    LEFT JOIN inventory_batches ib 
                           ON p.id = ib.product_id AND ib.expiration_date > CURRENT_DATE
                    GROUP BY p.id
                ) AS stock_table
                WHERE calculated_stock > 0 AND calculated_stock <= 10
            `;

            const [products, categories, users, orders, inventory, expiring, pendingOrders, outOfStock, lowStock] = await Promise.all([
                pool.query('SELECT COUNT(*) FROM products'),
                pool.query('SELECT COUNT(*) FROM categories'),
                pool.query('SELECT COUNT(*) FROM users'),
                pool.query('SELECT COUNT(*) FROM orders'),
                pool.query('SELECT SUM(quantity) as total_items FROM inventory_batches'),
                pool.query(expiringQuery),
                pool.query(pendingOrderQuery),
                pool.query(outOfStockQuery),
                pool.query(lowStockQuery)
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
                    pendingOrders: parseInt(pendingOrders.rows[0].count) || 0,
                    outOfStockCount: parseInt(outOfStock.rows[0].count) || 0,
                    lowStockCount: parseInt(lowStock.rows[0].count) || 0
                }
            });
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu thống kê:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = dashboardController;