const pool = require('../config/db'); // Đảm bảo đường dẫn này khớp với cấu hình kết nối PostgreSQL của bạn

// [GET] Lấy danh sách kho hàng
const getWarehouses = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM warehouses ORDER BY id DESC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
};

// [POST] Thêm kho hàng mới
const createWarehouse = async (req, res) => {
    const { name, type, address, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO warehouses (name, type, address, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, type || 'main', address, status || 'active']
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi tạo kho hàng' });
    }
};

// [PUT] Cập nhật thông tin kho hàng
const updateWarehouse = async (req, res) => {
    const { id } = req.params;
    const { name, type, address, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE warehouses SET name = $1, type = $2, address = $3, status = $4 WHERE id = $5 RETURNING *',
            [name, type, address, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy kho hàng' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật kho hàng' });
    }   
};

const deleteWarehouse = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM warehouses WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy kho hàng' });
        }
        res.json({ success: true, message: 'Đã xóa kho hàng thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa kho hàng. Có thể do dữ liệu đang được liên kết.' });
    }
};

module.exports = {
    getWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
};