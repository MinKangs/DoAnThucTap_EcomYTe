import React, { useState } from 'react';
import { Container, Nav, Navbar, NavDropdown, Badge, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BsCart3, BsPersonCircle, BsSearch } from 'react-icons/bs';
import logoImg from '../assets/logo.png'; 
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ClientHeader = () => {
    const { cartCount } = useCart();
    const { user, logout } = useAuth(); 
    const navigate = useNavigate();
    const [searchKeyword, setSearchKeyword] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchKeyword.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchKeyword.trim())}`);
        }
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
                    
                    {/* KHU VỰC Ô TÌM KIẾM MỚI ĐƯỢC THÊM VÀO */}
                    <Form className="d-flex mx-auto w-50 position-relative" onSubmit={handleSearch}>
                        <Form.Control
                            type="search"
                            placeholder="Tìm theo tên thuốc, bệnh..."
                            className="rounded-pill pe-5"
                            aria-label="Search"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                        <Button variant="link" type="submit" className="position-absolute end-0 top-50 translate-middle-y text-muted">
                            <BsSearch />
                        </Button>
                    </Form>

                    <Nav className="ms-auto align-items-center gap-3">
                        <Nav.Link as={Link} to="/cart" className="text-white d-flex align-items-center position-relative">
                            <BsCart3 size={20} className="me-2" /> Giỏ thuốc
                            {cartCount > 0 && (
                                <Badge bg="danger" pill className="position-absolute" style={{ top: '0px', left: '15px', fontSize: '0.65rem' }}>
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
                            <Nav.Link as={Link} to="/login" className="text-white d-flex align-items-center border border-white rounded px-3 py-1 ms-2">
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