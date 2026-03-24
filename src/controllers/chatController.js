const pool = require('../config/db');

const chatController = {
    // 1. Khách hàng bắt đầu/lấy phiên chat
    initSession: async (req, res) => {
        const { session_token, user_id } = req.body;
        try {
            // Kiểm tra xem token này đã có phiên chat mở chưa
            const checkQuery = `SELECT * FROM chat_sessions WHERE session_token = $1 AND status = 'open'`;
            const checkResult = await pool.query(checkQuery, [session_token]);

            if (checkResult.rows.length > 0) {
                return res.json({ success: true, data: checkResult.rows[0] });
            }

            // Nếu chưa có, tạo phiên chat mới
            const insertQuery = `
                INSERT INTO chat_sessions (session_token, user_id) 
                VALUES ($1, $2) RETURNING *
            `;
            const newSession = await pool.query(insertQuery, [session_token, user_id || null]);
            res.json({ success: true, data: newSession.rows[0] });
        } catch (error) {
            console.error('Lỗi tạo phiên chat:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },

    // 2. Lấy danh sách tin nhắn của một phiên
    getMessages: async (req, res) => {
        const { session_token } = req.params;
        try {
            const query = `
                SELECT m.* FROM chat_messages m
                JOIN chat_sessions s ON m.session_id = s.id
                WHERE s.session_token = $1
                ORDER BY m.created_at ASC
            `;
            const result = await pool.query(query, [session_token]);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Lỗi lấy tin nhắn:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },

    // 3. Gửi tin nhắn mới
    sendMessage: async (req, res) => {
        const { session_token, sender_type, sender_id, message } = req.body;
        try {
            // Tìm ID của phiên chat từ token
            const sessionQuery = `SELECT id FROM chat_sessions WHERE session_token = $1`;
            const sessionResult = await pool.query(sessionQuery, [session_token]);
            
            if (sessionResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy phiên chat' });
            }
            
            const sessionId = sessionResult.rows[0].id;

            // Lưu tin nhắn
            const insertMsgQuery = `
                INSERT INTO chat_messages (session_id, sender_type, sender_id, message) 
                VALUES ($1, $2, $3, $4) RETURNING *
            `;
            const newMsg = await pool.query(insertMsgQuery, [sessionId, sender_type, sender_id || null, message]);
            
            // Cập nhật thời gian update của phiên chat
            await pool.query(`UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [sessionId]);

            res.json({ success: true, data: newMsg.rows[0] });
        } catch (error) {
            console.error('Lỗi gửi tin nhắn:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },

    // 4. Admin lấy danh sách tất cả phiên chat
    getAllSessions: async (req, res) => {
        try {
            const query = `
                SELECT s.*, 
                       u.full_name as user_name,
                       (SELECT message FROM chat_messages m WHERE m.session_id = s.id ORDER BY created_at DESC LIMIT 1) as last_message,
                       (SELECT created_at FROM chat_messages m WHERE m.session_id = s.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
                       (SELECT COUNT(*) FROM chat_messages m WHERE m.session_id = s.id AND m.sender_type = 'customer' AND m.is_read = FALSE) as unread_count
                FROM chat_sessions s
                LEFT JOIN users u ON s.user_id = u.id
                ORDER BY last_message_time DESC NULLS LAST
            `;
            const result = await pool.query(query);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Lỗi lấy danh sách phiên chat:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },
    
    deleteSession: async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('DELETE FROM chat_sessions WHERE id = $1', [id]);
            res.json({ success: true, message: 'Đã xóa phiên chat' });
        } catch (error) {
            console.error('Lỗi xóa chat:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },

    // Đánh dấu toàn bộ tin nhắn của 1 phiên là đã đọc
    markAsRead: async (req, res) => {
        const { session_token } = req.params;
        try {
            const sessionQuery = `SELECT id FROM chat_sessions WHERE session_token = $1`;
            const sessionResult = await pool.query(sessionQuery, [session_token]);
            if (sessionResult.rows.length > 0) {
                const sessionId = sessionResult.rows[0].id;
                await pool.query(`UPDATE chat_messages SET is_read = TRUE WHERE session_id = $1 AND sender_type = 'customer'`, [sessionId]);
            }
            res.json({ success: true });
        } catch (error) {
            console.error('Lỗi đánh dấu đã đọc:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },

    // Lấy tổng số tin nhắn chưa đọc của tất cả khách hàng
    getUnreadTotal: async (req, res) => {
        try {
            const query = `SELECT COUNT(*) FROM chat_messages WHERE sender_type = 'customer' AND is_read = FALSE`;
            const result = await pool.query(query);
            res.json({ success: true, unread_total: parseInt(result.rows[0].count) });
        } catch (error) {
            console.error('Lỗi đếm tổng tin nhắn:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
};

module.exports = chatController;