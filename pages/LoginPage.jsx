import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import api from '../services/api';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/users/login', { email, password });
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                const userRole = response.data.user.role;
                if (userRole === 'admin' || userRole === 'staff') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
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
        <div className="login-wrapper">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={5}>
                        <div className="login-card">
                            <h2 className="text-center mb-4">Hệ Thống Y Tế</h2>
                            
                            {error && <Alert variant="danger">{error}</Alert>}
                            
                            <Form onSubmit={handleLogin}>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Tài khoản Email</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        placeholder="Nhập địa chỉ email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="formBasicPassword">
                                    <div className="d-flex justify-content-between">
                                        <Form.Label>Mật khẩu</Form.Label>
                                        <Link to="/forgot-password" style={{ textDecoration: 'none', fontSize: '0.9rem', color: '#008ebc' }}>
                                            Quên mật khẩu?
                                        </Link>
                                    </div>
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Nhập mật khẩu" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Button type="submit" className="btn-medical w-100 mb-3">
                                    Đăng nhập hệ thống
                                </Button>

                                <div className="text-center mt-3" style={{ fontSize: '0.9rem' }}>
                                    Chưa có tài khoản? <Link to="/register" style={{ textDecoration: 'none', color: '#008ebc', fontWeight: 'bold' }}>Đăng ký ngay</Link>
                                </div>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LoginPage;