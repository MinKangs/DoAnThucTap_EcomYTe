import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { BsPerson, BsEnvelope, BsLock, BsTelephone } from 'react-icons/bs';
import api from '../services/api';
import './Auth.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: ''
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
       <div className="auth-wrapper py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={5}>
                        <div className="auth-card shadow p-4 bg-white rounded">
                            <h3 className="text-center mb-4 fw-bold">Đăng ký tài khoản</h3>
                            
                            {error && <Alert variant="danger">{error}</Alert>}
                            {successMsg && <Alert variant="success">{successMsg}</Alert>}
                            
                            <Form onSubmit={handleRegister}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Họ và tên</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light">
                                            <BsPerson />
                                        </InputGroup.Text>
                                        <Form.Control 
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
                                    <Form.Label>Tài khoản Email</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light">
                                            <BsEnvelope />
                                        </InputGroup.Text>
                                        <Form.Control 
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
                                    <Form.Label>Mật khẩu</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light">
                                            <BsLock />
                                        </InputGroup.Text>
                                        <Form.Control 
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
                                    <Form.Label>Số điện thoại</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-light">
                                            <BsTelephone />
                                        </InputGroup.Text>
                                        <Form.Control 
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
                                    className="w-100 mb-3 fw-bold py-2"
                                    disabled={loading}
                                >
                                    {loading ? <Spinner animation="border" size="sm" /> : 'Đăng ký tài khoản'}
                                </Button>

                                <div className="text-center mt-3" style={{ fontSize: '0.9rem' }}>
                                    Đã có tài khoản? <Link to="/login" className="text-success fw-bold text-decoration-none">Đăng nhập ngay</Link>
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