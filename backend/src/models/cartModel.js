const pool = require('../config/db');

const Cart = {
    // Tìm giỏ hàng của người dùng
    getCartByUserId: async (userId) => {
        const query = 'SELECT * FROM carts WHERE user_id = $1';
        const { rows } = await pool.query(query, [userId]);
        return rows[0];
    },

    // Tạo giỏ hàng mới nếu chưa có
    createCart: async (userId) => {
        const query = 'INSERT INTO carts (user_id) VALUES ($1) RETURNING *';
        const { rows } = await pool.query(query, [userId]);
        return rows[0];
    },

    // Lấy danh sách sản phẩm trong giỏ kèm thông tin chi tiết
    getCartItems: async (cartId) => {
        const query = `
            SELECT ci.id AS cart_item_id, ci.product_id, p.name, p.price, p.image_url, ci.quantity,
                   COALESCE((SELECT SUM(quantity) FROM inventory_batches WHERE product_id = p.id AND expiration_date > CURRENT_DATE), 0) AS stock
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = $1
            ORDER BY ci.id ASC
        `;
        const { rows } = await pool.query(query, [cartId]);
        return rows;
    },

    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    checkItemInCart: async (cartId, productId) => {
        const query = 'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2';
        const { rows } = await pool.query(query, [cartId, productId]);
        return rows[0];
    },

    // Thêm sản phẩm mới vào giỏ
    addItem: async (cartId, productId, quantity) => {
        const query = 'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *';
        const { rows } = await pool.query(query, [cartId, productId, quantity]);
        return rows[0];
    },

    // Cập nhật số lượng nếu sản phẩm đã tồn tại
    updateItemQuantity: async (cartItemId, quantity) => {
        const query = 'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *';
        const { rows } = await pool.query(query, [quantity, cartItemId]);
        return rows[0];
    },
    
    // Xóa sản phẩm khỏi giỏ
    removeItem: async (cartItemId) => {
        const query = 'DELETE FROM cart_items WHERE id = $1';
        await pool.query(query, [cartItemId]);
        return true;
    }
};

module.exports = Cart;