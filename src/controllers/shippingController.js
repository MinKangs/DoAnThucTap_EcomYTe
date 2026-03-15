const pool = require('../config/db');

const getShippingPartners = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM shipping_partners ORDER BY id DESC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
};

const createShippingPartner = async (req, res) => {
    const { name, phone, email, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO shipping_partners (name, phone, email, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, phone, email, status || 'active']
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi tạo đơn vị vận chuyển' });
    }
};

// [PUT] Cập nhật đối tác
const updateShippingPartner = async (req, res) => {
    const { id } = req.params;
    const { name, phone, email, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE shipping_partners SET name = $1, phone = $2, email = $3, status = $4 WHERE id = $5 RETURNING *',
            [name, phone, email, status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy đối tác' });
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật đối tác' });
    }
};

// [DELETE] Xóa đối tác
const deleteShippingPartner = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM shipping_partners WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy đối tác' });
        res.json({ success: true, message: 'Đã xóa đối tác thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa đối tác' });
    }
};



module.exports = { getShippingPartners, createShippingPartner, updateShippingPartner, deleteShippingPartner };  