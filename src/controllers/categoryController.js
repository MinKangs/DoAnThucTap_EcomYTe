const pool = require('../config/db');

// [GET] Lấy danh sách danh mục
const getCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY id DESC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
};

// [POST] Thêm danh mục mới
const createCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi tạo danh mục' });
    }
};

// [PUT] Cập nhật danh mục
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const result = await pool.query(
            'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật danh mục' });
    }
};

// [DELETE] Xóa danh mục
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        res.json({ success: true, message: 'Đã xóa danh mục thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Không thể xóa. Danh mục này đang chứa sản phẩm.' });
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };