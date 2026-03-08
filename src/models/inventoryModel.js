const pool = require('../config/db');

const Inventory = {
    // Lấy toàn bộ danh sách lô hàng kèm tên sản phẩm
    getAllBatches: async () => {
        const query = `
            SELECT ib.id, ib.batch_number, ib.import_date, ib.expiration_date, ib.quantity, p.name AS product_name
            FROM inventory_batches ib
            JOIN products p ON ib.product_id = p.id
            ORDER BY ib.expiration_date ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Thêm lô hàng mới (Nhập kho)
    addBatch: async (data) => {
        const { product_id, batch_number, import_date, expiration_date, quantity } = data;
        const query = `
            INSERT INTO inventory_batches (product_id, batch_number, import_date, expiration_date, quantity)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const values = [product_id, batch_number, import_date, expiration_date, quantity];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
};

module.exports = Inventory;