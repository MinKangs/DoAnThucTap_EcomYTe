import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { user, login } = useAuth(); // Lấy hàm login để cập nhật lại Context sau khi sửa tên
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/profile');
                if (response.data.success) {
                    const data = response.data.data;
                    setFormData({
                        full_name: data.full_name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        address: data.address || ''
                    });
                }
            } catch (error) {
                setMessage({ type: 'danger', text: 'Không thể tải thông tin hồ sơ.' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.put('/users/profile', {
                full_name: formData.full_name,
                phone: formData.phone,
                address: formData.address
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
                
                // Cập nhật lại Context và LocalStorage để Header đổi tên theo
                const updatedUser = { ...user, full_name: formData.full_name };
                const currentToken = localStorage.getItem('token');
                login(updatedUser, currentToken);
            }
        } catch (error) {
            setMessage({ type: 'danger', text: 'Lỗi khi cập nhật hồ sơ.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="success" />
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <h3 className="mb-4 fw-bold border-bottom pb-2">Hồ sơ cá nhân</h3>
                            
                            {message.text && <Alert variant={message.type}>{message.text}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Email (Không thể thay đổi)</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        value={formData.email} 
                                        disabled 
                                        className="bg-light"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Họ và tên</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="full_name"
                                        value={formData.full_name} 
                                        onChange={handleChange}
                                        required 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Số điện thoại</Form.Label>
                                    <Form.Control 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone} 
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">Địa chỉ giao hàng mặc định</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={3}
                                        name="address"
                                        value={formData.address} 
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Button variant="success" type="submit" className="w-100 fw-bold" disabled={saving}>
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;