const pool = require('../config/db');

const getLocations = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT sl.*, w.name AS warehouse_name 
            FROM storage_locations sl
            JOIN warehouses w ON sl.warehouse_id = w.id
            ORDER BY sl.id DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
};

const createLocation = async (req, res) => {
    const { warehouse_id, zone, shelf } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO storage_locations (warehouse_id, zone, shelf) VALUES ($1, $2, $3) RETURNING *',
            [warehouse_id, zone, shelf]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi tạo vị trí lưu trữ' });
    }
};

const updateLocation = async (req, res) => {
    const { id } = req.params;
    const { warehouse_id, zone, shelf } = req.body;
    try {
        const result = await pool.query(
            'UPDATE storage_locations SET warehouse_id = $1, zone = $2, shelf = $3 WHERE id = $4 RETURNING *',
            [warehouse_id, zone, shelf, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy vị trí' });
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật vị trí' });
    }
};

// [DELETE] Xóa vị trí
const deleteLocation = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM storage_locations WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy vị trí' });
        res.json({ success: true, message: 'Đã xóa vị trí thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa vị trí' });
    }
};

module.exports = { getLocations, createLocation, updateLocation, deleteLocation };