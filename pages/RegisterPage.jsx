import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import api from '../services/api';
import './RegisterPage.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        try {
            const response = await api.post('/users/register', formData);
            if (response.data.success) {
                setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message);
            } else {
                setError('Đã xảy ra lỗi khi kết nối đến máy chủ.');
            }
        }
    };

    return (
        <div className="register-wrapper">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={6}>
                        <div className="register-card">
                            <h2 className="text-center mb-4">Đăng ký tài khoản</h2>
                            
                            {error && <Alert variant="danger">{error}</Alert>}
                            {successMsg && <Alert variant="success">{successMsg}</Alert>}
                            
                            <Form onSubmit={handleRegister}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Họ và tên</Form.Label>
                                    <Form.Control 
                                        type="text" name="full_name" 
                                        placeholder="Nhập họ và tên" 
                                        required onChange={handleChange} 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Tài khoản Email</Form.Label>
                                    <Form.Control 
                                        type="email" name="email" 
                                        placeholder="Nhập địa chỉ email" 
                                        required onChange={handleChange} 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Mật khẩu</Form.Label>
                                    <Form.Control 
                                        type="password" name="password" 
                                        placeholder="Tạo mật khẩu (ít nhất 6 ký tự)" 
                                        required minLength="6" onChange={handleChange} 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Số điện thoại</Form.Label>
                                    <Form.Control 
                                        type="text" name="phone" 
                                        placeholder="Nhập số điện thoại liên hệ" 
                                        required onChange={handleChange} 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Địa chỉ</Form.Label>
                                    <Form.Control 
                                        type="text" name="address" 
                                        placeholder="Nhập địa chỉ nhận hàng dự kiến" 
                                        required onChange={handleChange} 
                                    />
                                </Form.Group>

                                <Button type="submit" className="btn-medical w-100 mb-3">
                                    Đăng ký tài khoản
                                </Button>

                                <div className="text-center mt-3" style={{ fontSize: '0.9rem' }}>
                                    Đã có tài khoản? <Link to="/login" style={{ textDecoration: 'none', color: '#008ebc', fontWeight: 'bold' }}>Đăng nhập ngay</Link>
                                </div>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default RegisterPage;