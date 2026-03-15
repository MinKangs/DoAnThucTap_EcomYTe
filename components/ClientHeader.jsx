import React from 'react';
import { Navbar, Container, Form, FormControl, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Badge } from 'react-bootstrap';
// Import các icon của Bootstrap
import { BsHospital, BsSearch, BsCart3, BsPersonCircle } from "react-icons/bs";

const ClientHeader = () => {
    return (
        <Navbar expand="lg" style={{ backgroundColor: 'var(--primary-green)' }} variant="dark" className="py-3 shadow-sm sticky-top">
            <Container>
                {/* Logo */}
                <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 d-flex align-items-center">
                    <span className="bg-white text-success rounded-circle d-inline-flex justify-content-center align-items-center me-2" style={{ width: '40px', height: '40px' }}>
                        <BsHospital size={24} />
                    </span>
                    Nhà Thuốc
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="client-navbar-nav" />
                
                <Navbar.Collapse id="client-navbar-nav">
                    {/* Thanh tìm kiếm */}
                    <Form className="d-flex flex-grow-1 mx-lg-5 my-2 my-lg-0">
                        <div className="input-group">
                            <FormControl
                                type="search"
                                placeholder="Tìm theo tên thuốc, bệnh..."
                                className="border-0 shadow-none"
                                aria-label="Search"
                            />
                            <Button variant="light" className="border-0 text-muted d-flex align-items-center">
                                <BsSearch />
                            </Button>
                        </div>
                    </Form>

                    {/* Các nút chức năng */}
                    <Nav className="ms-auto align-items-center gap-3">
                        <Nav.Link as={Link} to="/cart" className="text-white d-flex align-items-center">
                            <BsCart3 size={20} className="me-2" /> Giỏ thuốc
                        </Nav.Link>
                        <Nav.Link as={Link} to="/login" className="text-white d-flex align-items-center">
                            <BsPersonCircle size={20} className="me-2" /> Đăng nhập
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default ClientHeader;