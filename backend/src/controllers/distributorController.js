const Distributor = require('../models/distributorModel');

const distributorController = {
    getDistributors: async (req, res) => {
        try {
            const distributors = await Distributor.getAllDistributors();
            res.status(200).json({ success: true, count: distributors.length, data: distributors });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách nhà phân phối:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    addDistributor: async (req, res) => {
        try {
            const { name, tax_code, address, phone } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: 'Tên nhà phân phối là bắt buộc.' });
            }
            
            const newDistributor = await Distributor.createDistributor({ name, tax_code, address, phone });
            res.status(201).json({ success: true, message: 'Thêm nhà phân phối thành công', data: newDistributor });
        } catch (error) {
            // Bắt lỗi trùng mã số thuế (UNIQUE constraint)
            if (error.code === '23505') {
                return res.status(400).json({ success: false, message: 'Mã số thuế hoặc thông tin này đã tồn tại.' });
            }
            console.error('Lỗi khi thêm nhà phân phối:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    editDistributor: async (req, res) => {
        try {
            const updatedDistributor = await Distributor.updateDistributor(req.params.id, req.body);
            if (!updatedDistributor) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy nhà phân phối.' });
            }
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updatedDistributor });
        } catch (error) {
            console.error('Lỗi khi cập nhật nhà phân phối:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    removeDistributor: async (req, res) => {
        try {
            const result = await Distributor.checkAndDelete(req.params.id);
            if (!result.data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy nhà phân phối.' });
            }
            
            if (result.action === 'deactivated') {
                res.status(200).json({ success: true, message: 'Nhà phân phối có dữ liệu liên kết. Đã chuyển trạng thái sang Ngừng hợp tác.', data: result.data });
            } else {
                res.status(200).json({ success: true, message: 'Đã xóa hoàn toàn nhà phân phối khỏi hệ thống.' });
            }
        } catch (error) {
            console.error('Lỗi khi xử lý xóa nhà phân phối:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = distributorController;