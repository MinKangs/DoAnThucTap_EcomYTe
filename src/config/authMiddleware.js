const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Kiểm tra Header của request có chứa token dạng Bearer không
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Tách lấy chuỗi token
            token = req.headers.authorization.split(' ')[1];

            // Giải mã token bằng chuỗi khóa bí mật
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Gắn thông tin người dùng (id, role) vào request để Controller sử dụng
            req.user = decoded;
            next(); // Cho phép đi tiếp đến Controller xử lý chính
        } catch (error) {
            console.error('Lỗi xác thực token:', error);
            res.status(401).json({ success: false, message: 'Không có quyền truy cập, token không hợp lệ hoặc đã hết hạn.' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Không có quyền truy cập, thiếu token.' });
    }
};

module.exports = { protect };