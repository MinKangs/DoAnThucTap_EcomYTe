const pool = require('../config/db');

const User = {
    // Tìm người dùng theo email (Dùng cho đăng nhập và kiểm tra trùng lặp)
    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    },

    // Tạo tài khoản mới
    createUser: async (userData) => {
        const { full_name, email, password_hash, phone } = userData;
        const query = `
            INSERT INTO users (full_name, email, password_hash, phone)
            VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role, status;
        `;
        const values = [full_name, email, password_hash, phone];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    findById: async (id) => {
        // Không lấy trường password_hash để bảo mật
        const query = 'SELECT id, full_name, email, phone, address, role, status FROM users WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    updateProfile: async (id, data) => {
            const { full_name, phone, address } = data;
            // Sử dụng COALESCE: Nếu $1 (full_name truyền vào) bị rỗng, sẽ lấy lại full_name cũ của dòng đó
            const query = `
                UPDATE users
                SET full_name = COALESCE($1, full_name), 
                    phone = COALESCE($2, phone), 
                    address = COALESCE($3, address)
                WHERE id = $4 
                RETURNING id, full_name, email, phone, address, role;
            `;
            const values = [full_name, phone, address, id];
            const { rows } = await pool.query(query, values);
            return rows[0];
        }

};

module.exports = User;