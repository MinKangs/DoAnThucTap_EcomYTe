const pool = require('../config/db');

const dashboardController = {
    getSummary: async (req, res) => {
        try {
            // Chạy đồng thời nhiều câu lệnh đếm để tối ưu tốc độ
            const [products, categories, distributors, orders, inventory] = await Promise.all([
                pool.query('SELECT COUNT(*) FROM products'),
                pool.query('SELECT COUNT(*) FROM categories'),
                pool.query('SELECT COUNT(*) FROM distributors'),
                pool.query('SELECT COUNT(*) FROM orders'),
                pool.query('SELECT SUM(quantity) as total_items FROM inventory_batches')
            ]);

            res.json({
                success: true,
                data: {
                    totalProducts: parseInt(products.rows[0].count) || 0,
                    totalCategories: parseInt(categories.rows[0].count) || 0,
                    totalDistributors: parseInt(distributors.rows[0].count) || 0,
                    totalOrders: parseInt(orders.rows[0].count) || 0,
                    totalInventoryItems: parseInt(inventory.rows[0].total_items) || 0
                }
            });
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu thống kê:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = dashboardController;