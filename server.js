const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// 1. IMPORT CÁC THƯ VIỆN CHO WEBSOCKET
const http = require('http'); 
const { Server } = require('socket.io'); 

// Khởi tạo ứng dụng Express
const app = express();

// 2. BỌC EXPRESS BẰNG HTTP SERVER (BẮT BUỘC ĐỂ DÙNG SOCKET.IO)
const server = http.createServer(app);

// Cấu hình Middleware
app.use(cors());
app.use(express.json()); // Phân tích cú pháp dữ liệu JSON từ Frontend

// Cho phép truy cập tĩnh vào thư mục uploads qua đường dẫn /uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Khởi chạy kết nối Database
const db = require('./src/config/db');

// Route kiểm tra hệ thống cơ bản
app.get('/', (req, res) => {
    res.json({ message: 'Hệ thống Backend đang hoạt động tốt.' });
});

// =================================================================
// 3. KHU VỰC ĐĂNG KÝ CÁC ROUTES API (RESTful)
// =================================================================

// Bảo Mật & Xác thực
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Quản lý Người dùng
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);

// Quản lý Sản phẩm & Danh mục
const productRoutes = require('./src/routes/productRoutes');
app.use('/api/products', productRoutes);

const categoryRoutes = require('./src/routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

// Quản lý Mua sắm (Giỏ hàng & Đơn hàng)
const cartRoutes = require('./src/routes/cartRoutes');
app.use('/api/cart', cartRoutes);

const orderRoutes = require('./src/routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// Quản lý Kho hàng & Nhà phân phối
const inventoryRoutes = require('./src/routes/inventoryRoutes');
app.use('/api/inventory', inventoryRoutes);

const warehouseRoutes = require('./src/routes/warehouseRoutes');
app.use('/api/warehouses', warehouseRoutes);

const locationRoutes = require('./src/routes/locationRoutes');
app.use('/api/locations', locationRoutes);

const distributorRoutes = require('./src/routes/distributorRoutes');
app.use('/api/distributors', distributorRoutes);

app.use('/api/reports', require('./src/routes/reportRoutes'));

const dashboardRoutes = require('./src/routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// Tính năng Hỗ trợ trực tuyến (Chat)
const chatRoutes = require('./src/routes/chatRoutes');
app.use('/api/chat', chatRoutes);


// =================================================================
// 4. CẤU HÌNH WEBSOCKET (SOCKET.IO) CHO CHAT REAL-TIME & NOTIFICATIONS
// =================================================================
const io = new Server(server, {
    cors: {
        origin: "*", // Cho phép mọi origin (Frontend) kết nối tới
        methods: ["GET", "POST"]
    }
});

// Lưu trữ danh sách các user đang online (socket.id -> session_token)
const activeUsers = {};

io.on('connection', (socket) => {
    
    // --- LƯỒNG DÀNH CHO ADMIN/STAFF ---
    // Tham gia vào phòng chung để nhận thông báo pop-up toàn cục
    socket.on('join_admin_room', () => {
        socket.join('admin_global_room');
    });

    // Khi có 1 Admin/Staff click đọc tin nhắn, phát tín hiệu xóa thông báo cho những người còn lại
    socket.on('admin_read_message', (session_token) => {
        socket.to('admin_global_room').emit('clear_notification', session_token);
    });


    // --- LƯỒNG CHAT CHÍNH (KHÁCH HÀNG & ADMIN) ---
    // Tham gia vào một phiên chat cụ thể
    socket.on('join_chat', (session_token) => {
        socket.join(session_token); 
        activeUsers[socket.id] = session_token;
        
        // Phát tín hiệu báo người dùng này đang Online (chấm xanh)
        socket.broadcast.emit('user_online', session_token); 
    });

    // Xử lý gửi tin nhắn
    socket.on('send_message', (data) => {
        // 1. Phát tin nhắn vào phòng chat cụ thể để hiển thị
        io.to(data.session_token).emit('receive_message', data);
        
        // 2. Nếu người gửi là khách hàng, phát thêm thông báo Pop-up cho toàn bộ Admin/Staff
        if (data.sender_type === 'customer') {
            socket.to('admin_global_room').emit('new_customer_message', data);
        }
    });

    // Xử lý hiệu ứng "Đang soạn tin..."
    socket.on('typing', (data) => {
        // Báo cho đối phương biết mình đang gõ
        socket.to(data.session_token).emit('typing', data);
    });

    // Xử lý ngắt kết nối (tắt trình duyệt, mất mạng)
    socket.on('disconnect', () => {
        const token = activeUsers[socket.id];
        if (token) {
            // Phát tín hiệu tắt chấm xanh
            socket.broadcast.emit('user_offline', token);
            delete activeUsers[socket.id]; 
        }
    });
});

// =================================================================
// 5. KHỞI CHẠY MÁY CHỦ
// =================================================================
const PORT = process.env.PORT || 5000;

// Sử dụng server.listen để kích hoạt cả Express và Socket.IO
server.listen(PORT, () => {
    console.log(`Server Backend đang chạy tại http://localhost:${PORT}`);
});