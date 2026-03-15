const pool = require('../config/db');

const Product = {
    getAllProducts: async () => {
        const query = `
            SELECT p.*, 
                   c.name AS category_name, 
                   d.name AS distributor_name
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
                   d.name AS distributor_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN distributors d ON p.distributor_id = d.id
            WHERE p.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    createProduct: async (data) => {
        const { name, category_id, distributor_id, price, description, instruction, ingredients, image_url } = data;
        const query = `
            INSERT INTO products (name, category_id, distributor_id, price, description, instruction, ingredients, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `;
        const values = [
            name, 
            category_id || null, 
            distributor_id || null, 
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
        const { name, category_id, distributor_id, price, image_url, status } = data;
        
        const query = `
            UPDATE products 
            SET name = $1, 
                category_id = $2, 
                distributor_id = $3, 
                price = $4, 
                image_url = $5, 
                status = $6
            WHERE id = $7 
            RETURNING *
        `;
        const values = [
            name, 
            category_id || null, 
            distributor_id || null, 
            price, 
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
    }
};

module.exports = Product;