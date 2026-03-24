import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { BsBoxArrowRight, BsPersonCircle, BsHouseDoor } from 'react-icons/bs';
import AdminChatNotification from './AdminChatNotification';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout-wrapper position-relative">
            {/* Header đồng bộ màu xanh với trang khách */}
            <Navbar expand="lg" className="px-4 py-3 shadow-sm sticky-top" style={{ backgroundColor: '#198754' }}>
                <Container fluid>
                    <Navbar.Brand as={Link} to="/admin" className="fs-5 fw-bold text-white tracking-wide">
                        HỆ THỐNG QUẢN TRỊ NHÀ THUỐC
                    </Navbar.Brand>
                    
                    <Navbar.Toggle aria-controls="admin-navbar-nav" className="border-white" />
                    <Navbar.Collapse id="admin-navbar-nav" className="justify-content-end">
                        <Nav className="align-items-center gap-4">
                            <Nav.Link as={Link} to="/" className="text-white d-flex align-items-center fw-medium hover-opacity">
                                <BsHouseDoor className="me-2" size={20} /> Về trang khách
                            </Nav.Link>
                            
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="light" id="dropdown-user" className="d-flex align-items-center bg-transparent border-0 text-white shadow-none px-0">
                                    <BsPersonCircle size={24} className="me-2" />
                                    <span className="fw-medium">{user?.full_name || 'Quản trị viên'}</span>
                                </Dropdown.Toggle>
                                
                                <Dropdown.Menu className="shadow border-0 mt-2">
                                    <Dropdown.Item as={Link} to="/profile">Hồ sơ cá nhân</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout} className="text-danger fw-bold">
                                        <BsBoxArrowRight className="me-2" /> Đăng xuất
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Vùng hiển thị nội dung động */}
            <main className="admin-main-content bg-light min-vh-100 py-5">
                <Container>
                    <Outlet />
                </Container>
            </main>

            {/* Component Thông báo tin nhắn cho Admin/Staff */}
            <AdminChatNotification />
        </div>
    );
};

export default AdminLayout;