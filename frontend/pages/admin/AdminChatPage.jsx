import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, ListGroup, Form, Button, Badge } from 'react-bootstrap';
import { BsSendFill, BsPersonCircle, BsTrash } from 'react-icons/bs';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

let socket;

const AdminChatPage = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState({});
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    
    // Dùng Ref để Socket bắt được session đang mở hiện tại
    const activeSessionRef = useRef(null);

    useEffect(() => { activeSessionRef.current = activeSession; }, [activeSession]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUsers]);

    // Fetch dữ liệu khởi tạo
    const fetchSessions = async () => {
        try {
            const res = await api.get('/chat/sessions');
            if (res.data.success) {
                setSessions(res.data.data);
                res.data.data.forEach(s => socket.emit('join_chat', s.session_token));
            }
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
        }
    };

    useEffect(() => {
        socket = io('http://localhost:5000');
        fetchSessions();

        socket.on('user_online', (token) => setOnlineUsers(prev => new Set(prev).add(token)));
        
        socket.on('user_offline', (token) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(token);
                return newSet;
            });
        });

        socket.on('receive_message', (data) => {
            setActiveSession(currentActive => {
                if (currentActive?.session_token === data.session_token) {
                    setMessages(prev => {
                        if (prev.some(m => m.id === data.id)) return prev;
                        return [...prev, data];
                    });
                    
                    // Nếu đang mở khung chat này, gọi API đánh dấu đã đọc luôn
                    if(data.sender_type === 'customer') {
                        api.put(`/chat/session/${data.session_token}/read`);
                        socket.emit('admin_read_message', data.session_token);
                    }
                }
                return currentActive;
            });

            setSessions(prev => {
                const updatedSessions = [...prev];
                const index = updatedSessions.findIndex(s => s.session_token === data.session_token);
                if (index > -1) {
                    updatedSessions[index].last_message = data.message;
                    updatedSessions[index].last_message_time = Date.now();
                    
                    // TĂNG BIẾN ĐẾM CHƯA ĐỌC NẾU KHÔNG PHẢI LÀ KHUNG CHAT ĐANG MỞ
                    if (data.sender_type === 'customer' && activeSessionRef.current?.session_token !== data.session_token) {
                        updatedSessions[index].unread_count = parseInt(updatedSessions[index].unread_count || 0) + 1;
                    }

                    const [movedSession] = updatedSessions.splice(index, 1);
                    updatedSessions.unshift(movedSession);
                } else if (data.sender_type === 'customer') {
                    // Nếu là khách hoàn toàn mới, tải lại danh sách
                    fetchSessions();
                }
                return updatedSessions;
            });

            if (data.sender_type === 'customer') {
                setTypingUsers(prev => ({ ...prev, [data.session_token]: false }));
            }
        });

        socket.on('typing', (data) => {
            if (data.sender_type === 'customer') setTypingUsers(prev => ({ ...prev, [data.session_token]: data.isTyping }));
        });

        return () => socket.disconnect();
    }, []);

    const handleSelectSession = async (session) => {
        setActiveSession(session);
        
        // Reset unread_count trên Giao diện
        setSessions(prev => prev.map(s => s.id === session.id ? { ...s, unread_count: 0 } : s));
        
        // Gọi API cập nhật DB và phát tín hiệu thu hồi thông báo cho các Admin khác
        api.put(`/chat/session/${session.session_token}/read`);
        socket.emit('admin_read_message', session.session_token); 

        try {
            const res = await api.get(`/chat/session/${session.session_token}/messages`);
            if (res.data.success) setMessages(res.data.data);
        } catch (error) {
            console.error("Lỗi tải tin nhắn:", error);
        }
    };

    const handleDeleteSession = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn phiên chat này?')) {
            try {
                await api.delete(`/chat/session/${id}`);
                setSessions(sessions.filter(s => s.id !== id));
                if (activeSession?.id === id) setActiveSession(null);
            } catch (error) {
                console.error("Lỗi xóa chat:", error);
            }
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (activeSession) {
            socket.emit('typing', { session_token: activeSession.session_token, sender_type: 'staff', isTyping: true });
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing', { session_token: activeSession.session_token, sender_type: 'staff', isTyping: false });
            }, 1500);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !activeSession) return;

        const newMessage = {
            session_token: activeSession.session_token,
            sender_type: 'staff',
            sender_id: user?.id || null,
            message: inputValue.trim(),
            id: Date.now()
        };

        socket.emit('send_message', newMessage);
        socket.emit('typing', { session_token: activeSession.session_token, sender_type: 'staff', isTyping: false });
        setInputValue('');

        try {
            await api.post('/chat/message', newMessage);
        } catch (error) {
            console.error('Lỗi gửi tin nhắn:', error);
        }
    };

    return (
        <div className="admin-page-container p-4 h-100">
            <h3 className="fw-bold mb-4 text-dark">Hỗ trợ Khách hàng (Live Chat)</h3>
            <Row className="g-0 bg-white shadow-sm border rounded overflow-hidden" style={{ height: '75vh' }}>
                
                {/* CỘT TRÁI: DANH SÁCH */}
                <Col md={4} className="border-end d-flex flex-column h-100">
                    <div className="bg-light p-3 border-bottom fw-bold">Danh sách yêu cầu</div>
                    <ListGroup variant="flush" className="overflow-auto custom-scrollbar" style={{ flex: 1 }}>
                        {sessions.length === 0 ? (
                            <div className="text-center p-4 text-muted">Chưa có phiên chat nào</div>
                        ) : (
                            sessions.map(session => {
                                const hasUnread = parseInt(session.unread_count) > 0;
                                return (
                                    <ListGroup.Item 
                                        key={session.id} 
                                        action 
                                        active={activeSession?.id === session.id} 
                                        onClick={() => handleSelectSession(session)} 
                                        className={`border-bottom py-3 ${hasUnread ? 'bg-light' : ''}`}
                                    >
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <div className="position-relative-avatar d-flex align-items-center gap-2">
                                                <div className="position-relative">
                                                    <BsPersonCircle size={24} className={hasUnread ? "text-primary" : "text-secondary"} />
                                                    {onlineUsers.has(session.session_token) && <div className="online-dot"></div>}
                                                </div>
                                                {/* IN ĐẬM NẾU CÓ TIN CHƯA ĐỌC */}
                                                <span className={hasUnread ? "fw-bolder text-dark" : "fw-medium text-dark"}>
                                                    {session.user_name || 'Khách vãng lai'}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <small className={activeSession?.id === session.id ? "text-light" : (hasUnread ? "text-primary fw-bold" : "text-muted")}>
                                                    {session.last_message_time ? new Date(session.last_message_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : ''}
                                                </small>
                                                <Button variant="link" className={`p-0 text-danger ${activeSession?.id === session.id ? "text-white" : ""}`} onClick={(e) => handleDeleteSession(e, session.id)}>
                                                    <BsTrash />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className={`text-truncate small ${activeSession?.id === session.id ? "text-light" : (hasUnread ? "text-dark fw-bold" : "text-muted")}`} style={{maxWidth: '80%'}}>
                                                {typingUsers[session.session_token] ? <i className="text-success">Đang soạn tin...</i> : (session.last_message || '...')}
                                            </div>
                                            {/* HIỂN THỊ CON SỐ ĐỎ */}
                                            {hasUnread && (
                                                <Badge bg="danger" pill>{session.unread_count}</Badge>
                                            )}
                                        </div>
                                    </ListGroup.Item>
                                );
                            })
                        )}
                    </ListGroup>
                </Col>

                {/* CỘT PHẢI: CHI TIẾT TIN NHẮN */}
                <Col md={8} className="d-flex flex-column bg-light h-100 overflow-hidden">
                    {activeSession ? (
                        <>
                            <div className="bg-white p-3 border-bottom fw-bold d-flex align-items-center gap-2 shadow-sm z-1">
                                <div className="position-relative">
                                    <BsPersonCircle size={24} className="text-secondary" />
                                    {onlineUsers.has(activeSession.session_token) && <div className="online-dot"></div>}
                                </div>
                                <div>
                                    <div className="m-0 lh-1">Đang chat với: {activeSession.user_name || activeSession.session_token.substring(0, 15) + '...'}</div>
                                    {onlineUsers.has(activeSession.session_token) && <small className="text-success fw-normal" style={{ fontSize: '12px' }}>Đang hoạt động</small>}
                                </div>
                            </div>
                            
                            <div className="flex-grow-1 p-4 overflow-auto custom-scrollbar d-flex flex-column">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`d-flex align-items-end gap-2 mb-3 ${msg.sender_type === 'staff' ? 'align-self-end' : 'align-self-start'}`} style={{ maxWidth: '75%' }}>
                                        {msg.sender_type === 'customer' && <BsPersonCircle size={28} className="text-secondary flex-shrink-0" />}
                                        <div className={`p-2 px-3 text-break ${msg.sender_type === 'staff' ? 'bg-primary text-white' : 'bg-white border text-dark'}`} style={{ borderRadius: '18px', borderBottomRightRadius: msg.sender_type === 'staff' ? '4px' : '18px', borderBottomLeftRadius: msg.sender_type === 'customer' ? '4px' : '18px' }}>
                                            {msg.message}
                                        </div>
                                    </div>
                                ))}
                                {typingUsers[activeSession.session_token] && (
                                    <div className="d-flex align-items-end gap-2 mb-3 align-self-start" style={{ maxWidth: '75%' }}>
                                        <BsPersonCircle size={28} className="text-secondary flex-shrink-0" />
                                        <div className="typing-indicator">
                                            <div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <Form className="p-3 bg-white border-top d-flex gap-2 z-1" onSubmit={handleSendMessage}>
                                <Form.Control type="text" placeholder="Nhập tin nhắn phản hồi..." value={inputValue} onChange={handleInputChange} className="rounded-pill px-4 bg-light border-0" />
                                <Button type="submit" variant="primary" className="rounded-pill px-4 d-flex align-items-center gap-2" disabled={!inputValue.trim()}>
                                    <BsSendFill /> Gửi
                                </Button>
                            </Form>
                        </>
                    ) : (
                        <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                            <div className="text-center">
                                <BsPersonCircle size={50} className="mb-3 opacity-50" />
                                <h5>Chọn một cuộc hội thoại</h5>
                            </div>
                        </div>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default AdminChatPage;