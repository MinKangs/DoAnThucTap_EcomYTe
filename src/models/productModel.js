const pool = require('../config/db');

const Product = {
    getAllProducts: async () => {
        const query = 'SELECT * FROM products WHERE status = $1 ORDER BY id ASC';
        const { rows } = await pool.query(query, ['active']);
        return rows;
    },

    createProduct: async (data) => {
        const { name, category_id, distributor_id, price, description, instruction, ingredients, image_url } = data;
        const query = `
            INSERT INTO products (name, category_id, distributor_id, price, description, instruction, ingredients, image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `;
        const values = [name, category_id, distributor_id, price, description, instruction, ingredients, image_url];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    updateProduct: async (id, data) => {
        const { name, price, description, instruction, ingredients, image_url } = data;
        const query = `
            UPDATE products 
            SET name = $1, price = $2, description = $3, instruction = $4, ingredients = $5, image_url = $6
            WHERE id = $7 RETURNING *;
        `;
        const values = [name, price, description, instruction, ingredients, image_url, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Ẩn sản phẩm thay vì xóa cứng theo yêu cầu SRS
    hideProduct: async (id) => {
        const query = `UPDATE products SET status = 'hidden' WHERE id = $1 RETURNING *;`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};

module.exports = Product;