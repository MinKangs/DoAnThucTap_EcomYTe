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
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { product_id, location_id, batch_number, import_date, expiration_date, quantity, created_by } = data;

            // 1. Truy vấn lấy warehouse_id từ bảng storage_locations để ghi log cho chính xác
            const locRes = await client.query('SELECT warehouse_id FROM storage_locations WHERE id = $1', [location_id]);
            const warehouse_id = locRes.rows.length > 0 ? locRes.rows[0].warehouse_id : null;

            // 2. Thêm dữ liệu vào bảng lô hàng (inventory_batches)
            const batchQuery = `
                INSERT INTO inventory_batches (product_id, location_id, warehouse_id, batch_number, import_date, expiration_date, quantity) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `;
            const batchResult = await client.query(batchQuery, [product_id, location_id, warehouse_id, batch_number, import_date, expiration_date, quantity]);
            const newBatch = batchResult.rows[0];

            // 3. Ghi lịch sử giao dịch (Loại: 'import')
            const transQuery = `
                INSERT INTO inventory_transactions (product_id, batch_id, warehouse_id, transaction_type, quantity, note, created_by)
                VALUES ($1, $2, $3, 'import', $4, $5, $6)
            `;
            await client.query(transQuery, [
                product_id, 
                newBatch.id, 
                warehouse_id, 
                quantity, 
                'Nhập kho hàng mới', 
                created_by || null
            ]);

            await client.query('COMMIT');
            return newBatch;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
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
    },

    // Lấy lịch sử giao dịch kho
    getTransactionHistory: async () => {
        const query = `
            SELECT it.*, 
                   p.name AS product_name, 
                   ib.batch_number, 
                   w.name AS warehouse_name, 
                   u.full_name AS created_by_name
            FROM inventory_transactions it
            LEFT JOIN products p ON it.product_id = p.id
            LEFT JOIN inventory_batches ib ON it.batch_id = ib.id
            LEFT JOIN warehouses w ON it.warehouse_id = w.id
            LEFT JOIN users u ON it.created_by = u.id
            ORDER BY it.created_at DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }
};

module.exports = Inventory;