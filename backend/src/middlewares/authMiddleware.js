const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Truy cập bị từ chối. Không tìm thấy token xác thực.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

// Chỉ dành riêng cho Admin (Dùng cho userRoutes)
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Truy cập bị từ chối. Yêu cầu quyền Quản trị viên.' });
    }
};

// Dành cho cả Admin và Nhân viên (Dùng cho productRoutes, orderRoutes, categoryRoutes...)
const isStaffOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Truy cập bị từ chối. Không đủ thẩm quyền thao tác.' });
    }
};

module.exports = { verifyToken, isAdmin, isStaffOrAdmin };