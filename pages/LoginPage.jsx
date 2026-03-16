import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BsEnvelope, BsLock } from 'react-icons/bs';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css'; // Sử dụng chung file CSS

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
        <div className="auth-wrapper py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={5}>
                        <div className="auth-card shadow p-4 bg-white rounded">
                            <h3 className="text-center mb-4 fw-bold">Đăng Nhập</h3>
                            
                            {error && <Alert variant="danger">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tài khoản Email</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light auth-icon">
                                            <BsEnvelope />
                                        </InputGroup.Text>
                                        <Form.Control 
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
                                    <Form.Label>Mật khẩu</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light auth-icon">
                                            <BsLock />
                                        </InputGroup.Text>
                                        <Form.Control 
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
                                    className="w-100 fw-bold py-2 mb-3" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Spinner animation="border" size="sm" /> : 'Đăng Nhập'}
                                </Button>
                            </Form>
                            
                            <div className="text-center mt-3" style={{ fontSize: '0.9rem' }}>
                                <span>Chưa có tài khoản? </span>
                                <Link to="/register" className="text-success fw-bold text-decoration-none">
                                    Đăng ký ngay
                                </Link>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LoginPage;