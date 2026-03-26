const Inventory = require('../models/inventoryModel');

const inventoryController = {
    // [GET] Lấy danh sách kho
    getInventory: async (req, res) => {
        try {
            const batches = await Inventory.getAllBatches();
            res.status(200).json({ success: true, data: batches });
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu kho hàng:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // [POST] Xử lý nhập kho
    importBatch: async (req, res) => {
        try {
            const { product_id, location_id, batch_number, import_date, expiration_date, quantity } = req.body;
            const created_by = req.user?.id; // Lấy ID của nhân viên đang thao tác
            
            if (!product_id || !location_id || !batch_number || !import_date || !expiration_date || quantity == null) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin lô hàng và vị trí lưu trữ.' });
            }

            const newBatch = await Inventory.addBatch({ product_id, location_id, batch_number, import_date, expiration_date, quantity, created_by });
            res.status(201).json({ success: true, message: 'Nhập kho thành công', data: newBatch });
        } catch (error) {
            console.error('Lỗi khi nhập kho:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // [PUT] Cập nhật thông tin lô hàng
    updateBatch: async (req, res) => {
        try {
            const { id } = req.params;
            const updatedBatch = await Inventory.updateBatch(id, req.body);
            if (!updatedBatch) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy lô hàng' });
            }
            res.status(200).json({ success: true, message: 'Cập nhật lô hàng thành công', data: updatedBatch });
        } catch (error) {
            console.error('Lỗi khi cập nhật lô hàng:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // [DELETE] Xóa lô hàng
    deleteBatch: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedBatch = await Inventory.deleteBatch(id);
            if (!deletedBatch) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy lô hàng' });
            }
            res.status(200).json({ success: true, message: 'Đã xóa lô hàng thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa lô hàng:', error);
            res.status(500).json({ success: false, message: 'Không thể xóa lô hàng này do có dữ liệu liên kết.' });
        }
    },

    // [GET] Lấy danh sách lịch sử giao dịch
    getTransactions: async (req, res) => {
        try {
            const transactions = await Inventory.getTransactionHistory();
            res.status(200).json({ success: true, data: transactions });
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử giao dịch kho:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = inventoryController;