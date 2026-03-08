const Inventory = require('../models/inventoryModel');

const inventoryController = {
    // Lấy danh sách kho
    getInventory: async (req, res) => {
        try {
            const batches = await Inventory.getAllBatches();
            res.status(200).json({ success: true, data: batches });
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu kho hàng:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // Xử lý nhập kho
    importBatch: async (req, res) => {
        try {
            const { product_id, batch_number, import_date, expiration_date, quantity } = req.body;
            
            // Kiểm tra dữ liệu đầu vào
            if (!product_id || !batch_number || !import_date || !expiration_date || quantity == null) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin lô hàng.' });
            }

            const newBatch = await Inventory.addBatch({ product_id, batch_number, import_date, expiration_date, quantity });
            res.status(201).json({ success: true, message: 'Nhập kho thành công', data: newBatch });
        } catch (error) {
            console.error('Lỗi khi nhập kho:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = inventoryController;