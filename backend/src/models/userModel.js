const pool = require('../config/db');

const User = {
    // Tìm người dùng theo email (Dùng cho đăng nhập và kiểm tra trùng lặp)
    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    },

    // Tạo tài khoản mới (Hỗ trợ cả User đăng ký và Admin tạo)
    createUser: async (userData) => {
        const { full_name, email, phone, role, status } = userData;
        // Hỗ trợ nhận cả 'password' (từ admin) hoặc 'password_hash' (từ register cũ)
        const password_hash = userData.password || userData.password_hash; 
        
        const query = `
            INSERT INTO users (full_name, email, password_hash, phone, role, status)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, role, status;
        `;
        const values = [full_name, email, password_hash, phone, role || 'user', status || 'active'];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    findById: async (id) => {
        // Không lấy trường password_hash để bảo mật
        const query = 'SELECT id, full_name, email, phone, address, role, status FROM users WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Cập nhật thông tin cá nhân (Dành cho Khách hàng)
    updateProfile: async (id, data) => {
        const { full_name, phone, address } = data;
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
    },

    // Lấy danh sách tất cả người dùng (Dành cho Admin)
    getAllUsers: async () => {
        const query = 'SELECT id, full_name, email, phone, address, role, status, created_at FROM users ORDER BY created_at DESC';
        const { rows } = await pool.query(query);
        return rows;
    },

    // Cập nhật toàn bộ thông tin tài khoản (Dành cho Admin)
    updateUser: async (id, data) => {
        const { full_name, email, phone, password, role, status } = data;
        const query = `
            UPDATE users
            SET full_name = COALESCE($1, full_name),
                email = COALESCE($2, email),
                phone = COALESCE($3, phone),
                password_hash = COALESCE($4, password_hash),
                role = COALESCE($5, role),
                status = COALESCE($6, status)
            WHERE id = $7
            RETURNING id, full_name, email, role, status;
        `;
        const values = [full_name, email, phone, password, role, status, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Xóa tài khoản (Dành cho Admin)
    deleteUser: async (id) => {
        const query = 'DELETE FROM users WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    }
};

module.exports = User;