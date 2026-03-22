import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BsEnvelope, BsLock, BsHeartPulseFill } from 'react-icons/bs'; 
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css'; 

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', formData);

            if (response.data.success) {
                login(response.data.user, response.data.token);
                
                if (response.data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-background">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={5}>
                        <Card className="auth-card">
                            <div className="auth-card-header pb-2">
                                <div className="auth-icon-wrapper">
                                    <BsHeartPulseFill size={32} />
                                </div>
                                <h4 className="fw-bold text-dark mt-3 mb-1">Đăng Nhập</h4>
                                <p className="text-muted small">Truy cập vào tài khoản của bạn</p>
                            </div>
                            
                            <Card.Body className="p-4 pt-3">
                                {error && <Alert variant="danger" className="py-2">{error}</Alert>}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold small">Tài khoản Email</Form.Label>
                                        <InputGroup className="shadow-sm">
                                            <InputGroup.Text className="text-muted border-end-0">
                                                <BsEnvelope />
                                            </InputGroup.Text>
                                            <Form.Control 
                                                className="border-start-0 ps-0"
                                                type="email" 
                                                name="email"
                                                placeholder="Nhập email của bạn" 
                                                value={formData.email}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold small">Mật khẩu</Form.Label>
                                        <InputGroup className="shadow-sm">
                                            <InputGroup.Text className="text-muted border-end-0">
                                                <BsLock />
                                            </InputGroup.Text>
                                            <Form.Control 
                                                className="border-start-0 ps-0"
                                                type="password" 
                                                name="password"
                                                placeholder="Nhập mật khẩu" 
                                                value={formData.password}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Button 
                                        variant="success" 
                                        type="submit" 
                                        className="w-100 fw-bold py-2 mb-3 shadow-sm" 
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Spinner animation="border" size="sm" /> : 'Đăng Nhập'}
                                    </Button>
                                </Form>
                                
                                <div className="text-center mt-2" style={{ fontSize: '0.9rem' }}>
                                    <span className="text-muted">Chưa có tài khoản? </span>
                                    <Link to="/register" className="text-success fw-bold text-decoration-none">
                                        Đăng ký ngay
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LoginPage;