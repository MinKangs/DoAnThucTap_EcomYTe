import React, { useState } from 'react';
import { Container, Nav, Navbar, NavDropdown, Badge, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BsCart3, BsPersonCircle, BsSearch, BsMic, BsMicFill } from 'react-icons/bs';
import logoImg from '../assets/logo.png'; 
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ClientHeader = () => {
    const { cartCount } = useCart();
    const { user, logout } = useAuth(); 
    const navigate = useNavigate();
    
    // Gộp chung một state để quản lý từ khóa tìm kiếm
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);

    // Xử lý tìm kiếm bằng văn bản thông thường
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Xử lý tìm kiếm bằng giọng nói
    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert("Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói. Hãy dùng Chrome hoặc Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN'; // Đặt ngôn ngữ tiếng Việt
        recognition.interimResults = false; // Chỉ lấy kết quả cuối cùng

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            // Xóa dấu chấm câu thừa ở cuối (đặc thù của API nhận diện)
            const cleanTranscript = transcript.replace(/[.]$/, '');
            setSearchQuery(cleanTranscript);
            
            // Tự động chuyển hướng tìm kiếm ngay sau khi nhận diện xong
            navigate(`/products?search=${encodeURIComponent(cleanTranscript)}`);
        };

        recognition.onerror = (event) => {
            console.error("Lỗi nhận diện giọng nói: ", event.error);
            setIsListening(false);
            if(event.error === 'not-allowed') {
                alert('Vui lòng cấp quyền sử dụng Micro cho trình duyệt để dùng tính năng này.');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        // Bắt đầu thu âm
        recognition.start();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar expand="lg" className="py-3" style={{ backgroundColor: 'var(--primary-green)' }} sticky="top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 py-1">
                    <div className="header-logo-container">
                        <img 
                            src={logoImg} 
                            alt="Logo Nhà Thuốc" 
                            className="header-logo-img"
                        />
                    </div>
                    <span className="fw-bold text-white d-none d-md-block fs-5 ms-2">MEDIC-SHOP</span>
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-white" />
                <Navbar.Collapse id="basic-navbar-nav">
                    
                    {/* KHU VỰC Ô TÌM KIẾM CÓ MICRO */}
                    <Form className="d-flex mx-auto position-relative" style={{ width: '100%', maxWidth: '500px' }} onSubmit={handleSearchSubmit}>
                        <Form.Control
                            type="search"
                            placeholder="Tìm theo tên thuốc, bệnh..."
                            className="rounded-pill"
                            style={{ paddingRight: '80px', paddingLeft: '20px' }} // Chừa chỗ cho 2 nút
                            aria-label="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        
                        {/* Nút Micro */}
                        <div 
                            className="position-absolute top-50 translate-middle-y" 
                            style={{ right: '45px', cursor: 'pointer', zIndex: 5 }}
                            onClick={handleVoiceSearch}
                            title="Tìm kiếm bằng giọng nói"
                        >
                            {isListening ? (
                                <BsMicFill size={20} className="text-danger" style={{ animation: 'pulse 1s infinite' }} />
                            ) : (
                                <BsMic size={20} className="text-secondary" />
                            )}
                        </div>

                        {/* Nút Kính lúp (Search) */}
                        <Button 
                            variant="link" 
                            type="submit" 
                            className="position-absolute end-0 top-50 translate-middle-y text-muted pe-3"
                            style={{ zIndex: 5 }}
                        >
                            <BsSearch size={18} />
                        </Button>
                    </Form>

                    <Nav className="ms-auto align-items-center gap-3 mt-3 mt-lg-0">
                        <Nav.Link as={Link} to="/cart" className="text-white d-flex align-items-center position-relative">
                            <BsCart3 size={20} className="me-2" /> Giỏ thuốc
                            {cartCount > 0 && (
                                <Badge bg="danger" pill className="position-absolute" style={{ top: '-5px', left: '15px', fontSize: '0.7rem' }}>
                                    {cartCount}
                                </Badge>
                            )}
                        </Nav.Link>

                        {user ? (
                            <NavDropdown 
                                title={
                                    <span className="text-white d-inline-flex align-items-center">
                                        <BsPersonCircle size={18} className="me-2" /> 
                                        {user.full_name}
                                    </span>
                                } 
                                id="user-nav-dropdown"
                                align="end"
                            >
                                {(user?.role === 'admin' || user?.role === 'staff') && (
                                <NavDropdown.Item as={Link} to="/admin">Trang Quản Trị</NavDropdown.Item>
                                )}
                                <NavDropdown.Item as={Link} to="/profile">Hồ sơ cá nhân</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/my-orders">Lịch sử đơn hàng</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout} className="text-danger">Đăng xuất</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link as={Link} to="/login" className="text-white d-flex align-items-center border border-white rounded px-3 py-1 ms-lg-2">
                                <BsPersonCircle size={18} className="me-2" /> Đăng nhập
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default ClientHeader;