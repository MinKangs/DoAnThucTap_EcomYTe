const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = {
    // Xử lý Use Case Đăng ký
    register: async (req, res) => {
        try {
            const { full_name, email, password, phone } = req.body;

            // Kiểm tra email đã tồn tại chưa
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email này đã được sử dụng.' });
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            // Lưu vào CSDL
            const newUser = await User.createUser({ full_name, email, password_hash, phone });

            res.status(201).json({ success: true, message: 'Đăng ký thành công', data: newUser });
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // Xử lý Use Case Đăng nhập
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Tìm người dùng
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
            }

            // Kiểm tra trạng thái tài khoản (Nguồn: 133)
            if (user.status === 'locked') {
                return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa.' });
            }

            // So sánh mật khẩu
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
            }

            // Tạo mã Token JWT
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' } // Token có hạn 1 ngày
            );

            res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                token: token,
                user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
            });
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // Lấy thông tin cá nhân
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
            }
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            console.error('Lỗi khi lấy hồ sơ:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
        }
    },

    // Cập nhật thông tin cá nhân
    updateProfile: async (req, res) => {
        try {
            const updatedUser = await User.updateProfile(req.user.id, req.body);
            res.status(200).json({ success: true, message: 'Cập nhật hồ sơ thành công', data: updatedUser });
        } catch (error) {
            console.error('Lỗi khi cập nhật hồ sơ:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
        }
    },
};

module.exports = userController;