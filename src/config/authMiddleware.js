const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            console.error('Lỗi xác thực token:', error);
            res.status(401).json({ success: false, message: 'Không có quyền truy cập, token không hợp lệ hoặc đã hết hạn.' });
        }
    }
    if (!token) {
        res.status(401).json({ success: false, message: 'Không có quyền truy cập, thiếu token.' });
    }
};

// Hàm phân quyền dành cho Admin và Nhân viên
const authorizeAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Quyền truy cập bị từ chối. Khu vực dành riêng cho Quản trị viên.' });
    }
};

module.exports = { protect, authorizeAdmin };