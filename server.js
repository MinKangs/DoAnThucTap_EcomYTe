const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Khởi tạo ứng dụng
const app = express();

// Cấu hình Middleware
app.use(cors());
app.use(express.json()); // Phân tích cú pháp dữ liệu JSON từ Frontend

// Khởi chạy kết nối Database
const db = require('./src/config/db');

// Route kiểm tra hệ thống cơ bản
app.get('/', (req, res) => {
    res.json({ message: 'Hệ thống Backend đang hoạt động tốt.' });
});

// --- ĐĂNG KÝ ROUTE SẢN PHẨM ---
const productRoutes = require('./src/routes/productRoutes');
app.use('/api/products', productRoutes);
// -------------------------------------

// --- ĐĂNG KÝ ROUTE NGƯỜI DÙNG  ---
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);
// ---------------------------------------

// --- ĐĂNG KÝ ROUTE GIỎ HÀNG ---
const cartRoutes = require('./src/routes/cartRoutes');
app.use('/api/cart', cartRoutes);
// -------------------------------------

// --- ĐĂNG KÝ ROUTE ĐƠN HÀNG ---
const orderRoutes = require('./src/routes/orderRoutes');
app.use('/api/orders', orderRoutes);
// --------------------------------------

// --- ĐĂNG KÝ ROUTE KHO HÀNG ---
const inventoryRoutes = require('./src/routes/inventoryRoutes');
app.use('/api/inventory', inventoryRoutes);

// --- ĐĂNG KÝ ROUTE THỐNG KÊ BÁO CÁO ---
const reportRoutes = require('./src/routes/reportRoutes');
app.use('/api/reports', reportRoutes);

// --- ĐĂNG KÝ ROUTE NHÀ PHÂN PHỐI ---
const distributorRoutes = require('./src/routes/distributorRoutes');
app.use('/api/distributors', distributorRoutes);

// Thiết lập cổng và chạy máy chủ
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Backend đang chạy tại http://localhost:${PORT}`);
});