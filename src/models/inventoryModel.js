const pool = require('../config/db');

const Inventory = {
    getAllBatches: async () => {
        const query = `
            SELECT ib.*, p.name AS product_name, sl.zone, sl.shelf, w.name AS warehouse_name 
            FROM inventory_batches ib
            JOIN products p ON ib.product_id = p.id
            LEFT JOIN storage_locations sl ON ib.location_id = sl.id
            LEFT JOIN warehouses w ON sl.warehouse_id = w.id
            ORDER BY ib.expiration_date ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    addBatch: async (data) => {
        const { product_id, location_id, batch_number, import_date, expiration_date, quantity } = data;
        const query = `
            INSERT INTO inventory_batches (product_id, location_id, batch_number, import_date, expiration_date, quantity) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const result = await pool.query(query, [product_id, location_id, batch_number, import_date, expiration_date, quantity]);
        return result.rows[0];
    },

    updateBatch: async (id, data) => {
        const { location_id, batch_number, import_date, expiration_date, quantity } = data;
        const query = `
            UPDATE inventory_batches 
            SET location_id = $1, batch_number = $2, import_date = $3, expiration_date = $4, quantity = $5
            WHERE id = $6 RETURNING *
        `;
        const result = await pool.query(query, [location_id, batch_number, import_date, expiration_date, quantity, id]);
        return result.rows[0];
    },

    deleteBatch: async (id) => {
        const query = 'DELETE FROM inventory_batches WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
};

module.exports = Inventory;