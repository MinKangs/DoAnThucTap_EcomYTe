const pool = require('../config/db');

const Product = {
    getAllProducts: async () => {
        const query = `
            SELECT p.*, 
                   c.name AS category_name, 
                   d.name AS distributor_name,
                   COALESCE((SELECT SUM(quantity) FROM inventory_batches WHERE product_id = p.id AND expiration_date > CURRENT_DATE), 0) AS total_stock
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN distributors d ON p.distributor_id = d.id
            ORDER BY p.created_at DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    getProductById: async (id) => {
        const query = `
            SELECT p.*, 
                   c.name AS category_name, 
                   d.name AS distributor_name,
                   COALESCE((SELECT SUM(quantity) FROM inventory_batches WHERE product_id = p.id AND expiration_date > CURRENT_DATE), 0) AS total_stock
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN distributors d ON p.distributor_id = d.id
            WHERE p.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    createProduct: async (data) => {
        const { name, category_id, distributor_id, manufacturer, price, description, instruction, ingredients, image_url } = data;
        const query = `
            INSERT INTO products (name, category_id, distributor_id, manufacturer, price, description, instruction, ingredients, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
        `;
        const values = [
            name, 
            category_id || null, 
            distributor_id || null, 
            manufacturer || null,
            price, 
            description, 
            instruction, 
            ingredients, 
            image_url
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    updateProduct: async (id, data) => {
        const { name, category_id, distributor_id, manufacturer, price, description, image_url, status } = data;
        
        const query = `
            UPDATE products 
            SET name = $1, 
                category_id = $2, 
                distributor_id = $3, 
                manufacturer = $4,
                price = $5, 
                description = $6,
                image_url = $7, 
                status = $8
            WHERE id = $9 
            RETURNING *
        `;
        const values = [
            name, 
            category_id || null, 
            distributor_id || null, 
            manufacturer || null,
            price, 
            description,
            image_url, 
            status, 
            id
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Ẩn sản phẩm thay vì xóa cứng theo yêu cầu SRS
    hideProduct: async (id) => {
        const query = `UPDATE products SET status = 'hidden' WHERE id = $1 RETURNING *;`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }, 

    // Kiểm tra xem sản phẩm đã có trong hóa đơn nào chưa
    checkProductInOrders: async (id) => {
        const { rows } = await pool.query('SELECT id FROM order_items WHERE product_id = $1 LIMIT 1', [id]);
        return rows.length > 0;
    },

    // Xóa vĩnh viễn (Xóa sạch khỏi Database)
    hardDeleteProduct: async (id) => {
        const query = `DELETE FROM products WHERE id = $1 RETURNING *;`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
    
};

module.exports = Product;