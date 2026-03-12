import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold">
                    HỆ THỐNG Y TẾ
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
                        <Nav.Link as={Link} to="/products">Sản phẩm</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link as={Link} to="/cart">Giỏ hàng</Nav.Link>
                        <Nav.Link as={Link} to="/login" className="btn btn-outline-light ms-2 btn-sm mt-1 mb-1">
                            Đăng nhập
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;