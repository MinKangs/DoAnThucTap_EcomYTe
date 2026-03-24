import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer, Badge } from 'react-bootstrap';
import { BsChatDotsFill } from 'react-icons/bs';
import { io } from 'socket.io-client';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

let socket;

const AdminChatNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [totalUnread, setTotalUnread] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchTotalUnread = async () => {
        try {
            const res = await api.get('/chat/unread-total');
            if(res.data.success) {
                setTotalUnread(res.data.unread_total);
            }
        } catch (error) {
            console.error("Lỗi lấy tổng tin nhắn:", error);
        }
    };

    useEffect(() => {
        fetchTotalUnread();

        socket = io('http://localhost:5000');
        socket.emit('join_admin_room');

        socket.on('new_customer_message', (data) => {
            // Tăng số đếm đỏ
            setTotalUnread(prev => prev + 1);

            // Bật Pop-up nếu KHÔNG ở trang chat
            if (location.pathname !== '/admin/chat') {
                setNotifications(prev => {
                    const filtered = prev.filter(n => n.session_token !== data.session_token);
                    return [...filtered, data];
                });
            }
        });

        // Khi có người đọc, xóa thông báo và tải lại tổng số đỏ
        socket.on('clear_notification', (session_token) => {
            setNotifications(prev => prev.filter(n => n.session_token !== session_token));
            fetchTotalUnread();
        });

        return () => socket.disconnect();
    }, [location.pathname]);

    const handleToastClick = (session_token) => {
        socket.emit('admin_read_message', session_token);
        navigate('/admin/chat');
        setNotifications(prev => prev.filter(n => n.session_token !== session_token));
    };

    return (
        <>
            {/* 1. Pop-up trượt (Toast) góc phải */}
            <ToastContainer position="bottom-end" className="p-4" style={{ zIndex: 9999, position: 'fixed' }}>
                {notifications.map((notif) => (
                    <Toast key={notif.id} onClose={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))} show={true} delay={8000} autohide style={{ cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        <Toast.Header onClick={() => handleToastClick(notif.session_token)}>
                            <div className="rounded-circle bg-success me-2" style={{ width: '10px', height: '10px' }}></div>
                            <strong className="me-auto text-dark">Tin nhắn từ khách hàng</strong>
                            <small className="text-muted">Vừa xong</small>
                        </Toast.Header>
                        <Toast.Body onClick={() => handleToastClick(notif.session_token)} className="text-truncate">
                            {notif.message}
                        </Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>

            {/* 2. Nút Chat Nổi góc TRÁI dưới cùng kèm số đỏ (Chỉ hiện khi KHÔNG ở trang chat) */}
            {location.pathname !== '/admin/chat' && (
                <div 
                    onClick={() => navigate('/admin/chat')}
                    className="position-fixed d-flex align-items-center justify-content-center shadow"
                    style={{
                        bottom: '30px', left: '30px', width: '60px', height: '60px', 
                        backgroundColor: '#198754', borderRadius: '50%', color: 'white', 
                        cursor: 'pointer', zIndex: 9998, transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <BsChatDotsFill size={28} />
                    {totalUnread > 0 && (
                        <Badge bg="danger" pill className="position-absolute border border-light" style={{ top: '-2px', right: '-2px', fontSize: '0.8rem' }}>
                            {totalUnread > 99 ? '99+' : totalUnread}
                        </Badge>
                    )}
                </div>
            )}
        </>
    );
};

export default AdminChatNotification;