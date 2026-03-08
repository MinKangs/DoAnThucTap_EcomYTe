const Report = require('../models/reportModel');

const reportController = {
    getDashboardStats: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            const summary = await Report.getRevenueSummary(startDate, endDate);
            const topProducts = await Report.getTopSellingProducts();

            res.status(200).json({
                success: true,
                data: {
                    summary: {
                        total_orders: parseInt(summary.total_orders, 10),
                        total_revenue: parseFloat(summary.total_revenue)
                    },
                    top_products: topProducts
                }
            });
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu thống kê:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = reportController;