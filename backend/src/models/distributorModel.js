const pool = require('../config/db');

const Distributor = {
    getAllDistributors: async () => {
        const query = 'SELECT * FROM distributors ORDER BY id DESC';
        const { rows } = await pool.query(query);
        return rows;
    },

    createDistributor: async (data) => {
        const { name, tax_code, address, phone } = data;
        const query = `
            INSERT INTO distributors (name, tax_code, address, phone)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const { rows } = await pool.query(query, [name, tax_code, address, phone]);
        return rows[0];
    },

    updateDistributor: async (id, data) => {
        const { name, tax_code, address, phone, status } = data;
        const query = `
            UPDATE distributors 
            SET name = COALESCE($1, name),
                tax_code = COALESCE($2, tax_code),
                address = COALESCE($3, address),
                phone = COALESCE($4, phone),
                status = COALESCE($5, status)
            WHERE id = $6 RETURNING *;
        `;
        const { rows } = await pool.query(query, [name, tax_code, address, phone, status, id]);
        return rows[0];
    },

    // Kiểm tra liên kết và xử lý xóa / ngừng hợp tác
    checkAndDelete: async (id) => {
        // Kiểm tra xem nhà phân phối có sản phẩm liên kết không
        const checkQuery = 'SELECT COUNT(*) FROM products WHERE distributor_id = $1';
        const checkResult = await pool.query(checkQuery, [id]);
        
        if (parseInt(checkResult.rows[0].count) > 0) {
            // Có liên kết -> Chuyển trạng thái sang inactive
            const updateQuery = "UPDATE distributors SET status = 'inactive' WHERE id = $1 RETURNING *";
            const { rows } = await pool.query(updateQuery, [id]);
            return { action: 'deactivated', data: rows[0] };
        } else {
            // Không có liên kết -> Xóa cứng
            const deleteQuery = 'DELETE FROM distributors WHERE id = $1 RETURNING *';
            const { rows } = await pool.query(deleteQuery, [id]);
            return { action: 'deleted', data: rows[0] };
        }
    }
};

module.exports = Distributor;