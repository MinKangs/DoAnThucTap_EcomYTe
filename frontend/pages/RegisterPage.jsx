import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { BsPerson, BsEnvelope, BsLock, BsTelephone, BsHeartPulseFill } from 'react-icons/bs';
import api from '../services/api';
import './Auth.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        full_name: '', email: '', password: '', phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const response = await api.post('/auth/register', formData);
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
        } finally {
            setLoading(false);
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
                                <h4 className="fw-bold text-dark mt-3 mb-1">Tạo Tài Khoản</h4>
                                <p className="text-muted small">Điền thông tin để đăng ký</p>
                            </div>
                            
                            <Card.Body className="p-4 pt-3">
                                {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                                {successMsg && <Alert variant="success" className="py-2">{successMsg}</Alert>}
                                
                                <Form onSubmit={handleRegister}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold small">Họ và tên</Form.Label>
                                        <InputGroup className="shadow-sm">
                                            <InputGroup.Text className="text-muted border-end-0">
                                                <BsPerson />
                                            </InputGroup.Text>
                                            <Form.Control 
                                                className="border-start-0 ps-0"
                                                type="text" 
                                                name="full_name" 
                                                placeholder="Nhập họ và tên" 
                                                required 
                                                onChange={handleChange} 
                                                value={formData.full_name}
                                            />
                                        </InputGroup>
                                    </Form.Group>

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
                                                placeholder="Nhập địa chỉ email" 
                                                required 
                                                onChange={handleChange} 
                                                value={formData.email}
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold small">Mật khẩu</Form.Label>
                                        <InputGroup className="shadow-sm">
                                            <InputGroup.Text className="text-muted border-end-0">
                                                <BsLock />
                                            </InputGroup.Text>
                                            <Form.Control 
                                                className="border-start-0 ps-0"
                                                type="password" 
                                                name="password" 
                                                placeholder="Tạo mật khẩu (ít nhất 6 ký tự)" 
                                                required 
                                                minLength="6" 
                                                onChange={handleChange} 
                                                value={formData.password}
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold small">Số điện thoại</Form.Label>
                                        <InputGroup className="shadow-sm">
                                            <InputGroup.Text className="text-muted border-end-0">
                                                <BsTelephone />
                                            </InputGroup.Text>
                                            <Form.Control 
                                                className="border-start-0 ps-0"
                                                type="tel" 
                                                name="phone" 
                                                placeholder="Nhập số điện thoại liên hệ" 
                                                required 
                                                onChange={handleChange} 
                                                value={formData.phone}
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Button 
                                        type="submit" 
                                        variant="success" 
                                        className="w-100 fw-bold py-2 mb-3 shadow-sm"
                                        disabled={loading}
                                    >
                                        {loading ? <Spinner animation="border" size="sm" /> : 'Đăng ký tài khoản'}
                                    </Button>

                                    <div className="text-center mt-2" style={{ fontSize: '0.9rem' }}>
                                        <span className="text-muted">Đã có tài khoản? </span>
                                        <Link to="/login" className="text-success fw-bold text-decoration-none">
                                            Đăng nhập ngay
                                        </Link>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default RegisterPage;