const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    register: async (req, res) => {
        try {
            const { full_name, email, password, phone } = req.body;

            // Kiểm tra email đã tồn tại chưa
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email này đã được sử dụng.' });
            }

            // Mã hóa mật khẩu (Salt round = 10)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Lưu vào CSDL - Gọi đúng hàm createUser và truyền password_hash
            const newUser = await User.createUser({
                full_name, 
                email, 
                password_hash: hashedPassword, 
                phone
            });

            res.status(201).json({ success: true, message: 'Đăng ký thành công', data: newUser });
        } catch (error) {
            console.error('Lỗi khi đăng ký:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Kiểm tra email
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
            }

            // Kiểm tra mật khẩu bằng bcrypt - Đối chiếu với trường password_hash
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
            }

            // Tạo mã thông báo JWT
            const payload = { id: user.id, role: user.role };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'ecom_yte_secret_key_2026', { expiresIn: '1d' });

            res.json({ 
                success: true, 
                message: 'Đăng nhập thành công', 
                token: token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = authController;