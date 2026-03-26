import React, { useState, useEffect, useRef } from 'react';
import { BsChatDotsFill, BsX, BsSendFill, BsHeadset } from 'react-icons/bs';
import { Form, Button, Badge } from 'react-bootstrap'; // Đã thêm Badge
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import './ChatWidget.css';

let socket;

const ChatWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [sessionToken, setSessionToken] = useState(null);
    const [isStaffTyping, setIsStaffTyping] = useState(false);
    const [isStaffOnline, setIsStaffOnline] = useState(false);
    
    // Thêm state quản lý tin nhắn chưa đọc
    const [unreadCount, setUnreadCount] = useState(0); 
    const isOpenRef = useRef(isOpen); // Dùng ref để lấy giá trị mới nhất của isOpen trong Socket

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Cập nhật isOpenRef và Reset số đếm khi mở Chat
    useEffect(() => {
        isOpenRef.current = isOpen;
        if (isOpen) {
            scrollToBottom();
            setUnreadCount(0); // Xóa thông báo đỏ khi mở hộp thoại
        }
    }, [messages, isOpen, isStaffTyping]);

    useEffect(() => {
        socket = io('http://localhost:5000');

        const initChat = async () => {
            let token = localStorage.getItem('chat_session_token');
            if (!token) {
                token = 'session_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('chat_session_token', token);
            }
            setSessionToken(token);

            try {
                await api.post('/chat/session', { session_token: token, user_id: user?.id || null });
                const res = await api.get(`/chat/session/${token}/messages`);
                if (res.data.success) setMessages(res.data.data);
                
                socket.emit('join_chat', token);
            } catch (error) {
                console.error('Lỗi khởi tạo chat:', error);
            }
        };

        initChat();

        socket.on('user_online', () => setIsStaffOnline(true));
        socket.on('user_offline', () => setIsStaffOnline(false));

        socket.on('receive_message', (data) => {
            setMessages((prev) => {
                if (prev.some(m => m.id === data.id)) return prev;
                return [...prev, data];
            });
            
            if (data.sender_type === 'staff') {
                setIsStaffTyping(false);
                setIsStaffOnline(true);
                
                // TĂNG SỐ ĐẾM NẾU POP-UP ĐANG ĐÓNG
                if (!isOpenRef.current) {
                    setUnreadCount(prev => prev + 1);
                }
            }
        });

        socket.on('typing', (data) => {
            if (data.sender_type === 'staff') {
                setIsStaffTyping(data.isTyping);
                setIsStaffOnline(true);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (sessionToken) {
            socket.emit('typing', { session_token: sessionToken, sender_type: 'customer', isTyping: true });
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing', { session_token: sessionToken, sender_type: 'customer', isTyping: false });
            }, 1500);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !sessionToken) return;

        const newMessage = {
            session_token: sessionToken,
            sender_type: 'customer',
            sender_id: user?.id || null,
            message: inputValue.trim(),
            id: Date.now()
        };

        socket.emit('send_message', newMessage);
        socket.emit('typing', { session_token: sessionToken, sender_type: 'customer', isTyping: false });
        setInputValue('');

        try {
            await api.post('/chat/message', newMessage);
        } catch (error) {
            console.error('Lỗi lưu tin nhắn:', error);
        }
    };

    return (
        <div className="chat-widget-container">
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="d-flex align-items-center gap-2">
                            <div className="position-relative-avatar">
                                <div className="bg-white text-success rounded-circle d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
                                    <BsHeadset size={20} />
                                </div>
                                {isStaffOnline && <div className="online-dot" style={{bottom: '0px', right: '0px'}}></div>}
                            </div>
                            <div className="d-flex flex-column lh-1">
                                <span className="mb-1">Hỗ trợ trực tuyến</span>
                                {isStaffOnline ? (
                                    <small className="fw-normal" style={{fontSize: '11px', opacity: 0.9}}>Đang hoạt động</small>
                                ) : (
                                    <small className="fw-normal" style={{fontSize: '11px', opacity: 0.7}}>Vui lòng để lại tin nhắn</small>
                                )}
                            </div>
                        </div>
                        <BsX size={28} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
                    </div>
                    
                    <div className="chat-body custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="text-center text-muted mt-3">Xin chào! Chúng tôi có thể giúp gì cho bạn?</div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`chat-message-wrapper ${msg.sender_type}`}>
                                    {msg.sender_type === 'staff' && (
                                        <div className="chat-avatar bg-success text-white shadow-sm">
                                            <BsHeadset size={14} />
                                        </div>
                                    )}
                                    <div className={`chat-message ${msg.sender_type}`}>{msg.message}</div>
                                </div>
                            ))
                        )}
                        {isStaffTyping && (
                            <div className="chat-message-wrapper staff">
                                <div className="chat-avatar bg-success text-white shadow-sm"><BsHeadset size={14} /></div>
                                <div className="typing-indicator">
                                    <div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <Form className="chat-input-area" onSubmit={handleSendMessage}>
                        <Form.Control
                            type="text"
                            placeholder="Nhập tin nhắn..."
                            value={inputValue}
                            onChange={handleInputChange}
                            className="border-0 bg-light rounded-pill px-3"
                            style={{ boxShadow: 'none' }}
                        />
                        <Button type="submit" variant="success" className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', flexShrink: 0 }} disabled={!inputValue.trim()}>
                            <BsSendFill size={16} />
                        </Button>
                    </Form>
                </div>
            )}
            
            {/* NÚT BẬT/TẮT CHAT CÓ GẮN BADGE ĐỎ */}
            <div className="chat-widget-button position-relative" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <BsX size={34} /> : <BsChatDotsFill size={28} />}
                
                {/* Thông báo chưa đọc */}
                {!isOpen && unreadCount > 0 && (
                    <Badge 
                        bg="danger" 
                        pill 
                        className="position-absolute border border-light" 
                        style={{ top: '-2px', right: '-2px', fontSize: '0.75rem' }}
                    >
                        {unreadCount}
                    </Badge>
                )}
            </div>
        </div>
    );
};

export default ChatWidget;