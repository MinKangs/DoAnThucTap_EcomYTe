const User = require('../models/userModel');
const bcrypt = require('bcrypt'); // Cần thiết để Admin mã hóa mật khẩu khi tạo/sửa User

const userController = {
    // ==========================================
    // DÀNH CHO KHÁCH HÀNG (USER THƯỜNG)
    // ==========================================
    
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

    updateProfile: async (req, res) => {
        try {
            const updatedUser = await User.updateProfile(req.user.id, req.body);
            res.status(200).json({ success: true, message: 'Cập nhật hồ sơ thành công', data: updatedUser });
        } catch (error) {
            console.error('Lỗi khi cập nhật hồ sơ:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
        }
    },

    // ==========================================
    // DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)
    // ==========================================

    // Lấy danh sách (GET /api/users)
    getAllUsers: async (req, res) => {
        try {
            const users = await User.getAllUsers();
            res.status(200).json({ success: true, count: users.length, data: users });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // Tạo người dùng mới (POST /api/users)
    createUser: async (req, res) => {
        try {
            const { full_name, email, phone, password, role, status } = req.body;
            
            // Mã hóa mật khẩu do Admin cấp
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const userData = {
                full_name,
                email,
                phone,
                password: hashedPassword,
                role: role || 'user',
                status: status || 'active'
            };

            // Lưu ý: Cần đảm bảo model User có hàm createUser tương ứng
            const newUser = await User.createUser(userData);
            res.status(201).json({ success: true, message: 'Tạo tài khoản thành công', data: newUser });
        } catch (error) {
            console.error('Lỗi khi tạo tài khoản:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // Cập nhật người dùng (PUT /api/users/:id)
    updateUser: async (req, res) => {
        try {
            const targetUserId = parseInt(req.params.id);
            const updateData = { ...req.body };
            
            // Chặn Admin tự khóa tài khoản của chính mình (đã sửa 'locked' thành 'inactive' theo frontend)
            if (req.user.id === targetUserId && updateData.status === 'inactive') {
                return res.status(403).json({ success: false, message: 'Hệ thống từ chối thao tác: Không thể tự khóa tài khoản của chính mình.' });
            }

            // Nếu Admin có nhập mật khẩu mới, tiến hành mã hóa trước khi lưu
            if (updateData.password) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(updateData.password, salt);
            }

            // Lưu ý: Cần đảm bảo model User có hàm updateUser xử lý được các trường này
            const updatedUser = await User.updateUser(targetUserId, updateData);
            
            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
            }

            res.status(200).json({ success: true, message: 'Cập nhật tài khoản thành công', data: updatedUser });
        } catch (error) {
            console.error('Lỗi khi cập nhật tài khoản:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    },

    // Xóa/Khóa người dùng (DELETE /api/users/:id)
    deleteUser: async (req, res) => {
        try {
            const targetUserId = parseInt(req.params.id);

            // Chặn Admin tự xóa chính mình
            if (req.user.id === targetUserId) {
                return res.status(403).json({ success: false, message: 'Hệ thống từ chối thao tác: Không thể tự xóa tài khoản của chính mình.' });
            }

            // Lưu ý: Cần đảm bảo model User có hàm deleteUser
            await User.deleteUser(targetUserId);
            
            res.status(200).json({ success: true, message: 'Thao tác trên tài khoản thành công' });
        } catch (error) {
            console.error('Lỗi khi xóa tài khoản:', error);
            res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = userController;