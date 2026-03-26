const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Kiểm tra kết nối
pool.connect((err, client, release) => {
    if (err) {
        console.error('Lỗi kết nối cơ sở dữ liệu:', err.stack);
    } else {
        console.log('Đã kết nối thành công đến CSDL:', process.env.DB_NAME);
    }
});

module.exports = pool;