import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const { user } = useAuth(); // Lấy thông tin user đang đăng nhập

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        shipping_address: '',
        notes: '',
        payment_method: 'COD'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Nếu giỏ hàng trống thì đẩy về trang chủ
    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    // Tự động điền thông tin nếu người dùng đã đăng nhập và có sẵn hồ sơ
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.full_name || '',
                phone: user.phone || '',
                shipping_address: user.address || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Chuẩn bị dữ liệu gửi xuống Backend
            const orderData = {
                ...formData,
                user_id: user ? user.id : null, // Gắn ID người dùng vào đơn hàng
                total_amount: cartTotal,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const response = await api.post('/orders', orderData);

            if (response.data.success) {
                alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
                clearCart(); // Xóa giỏ hàng
                navigate('/my-orders'); // Đặt xong chuyển thẳng qua Lịch sử đơn hàng để xem luôn
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <h3 className="mb-4 fw-bold">Thông tin thanh toán</h3>
            
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmitOrder}>
                <Row>
                    {/* Cột trái: Form thông tin giao hàng */}
                    <Col lg={7} className="mb-4">
                        <div className="checkout-container">
                            <h5 className="mb-3 border-bottom pb-2">Thông tin người nhận</h5>
                            
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Họ và tên *</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="full_name" 
                                            placeholder="Nhập họ và tên" 
                                            value={formData.full_name} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Số điện thoại *</Form.Label>
                                        <Form.Control 
                                            type="tel" 
                                            name="phone" 
                                            placeholder="Nhập số điện thoại" 
                                            value={formData.phone} 
                                            onChange={handleChange} 
                                            required 
                                            pattern="[0-9]{10,11}"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Địa chỉ giao hàng chi tiết *</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="shipping_address" 
                                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành" 
                                    value={formData.shipping_address} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Ghi chú đơn hàng (Tùy chọn)</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3} 
                                    name="notes" 
                                    placeholder="Ghi chú về thời gian hoặc chỉ dẫn giao hàng" 
                                    value={formData.notes} 
                                    onChange={handleChange} 
                                />
                            </Form.Group>

                            <h5 className="mb-3 border-bottom pb-2">Phương thức thanh toán</h5>
                            <Form.Check 
                                type="radio" 
                                id="payment-cod" 
                                label="Thanh toán tiền mặt khi nhận hàng (COD)" 
                                name="payment_method" 
                                value="COD"
                                checked={formData.payment_method === 'COD'}
                                onChange={handleChange}
                            />
                        </div>
                    </Col>

                    {/* Cột phải: Tóm tắt đơn hàng */}
                    <Col lg={5}>
                        <div className="order-summary-box">
                            <h5 className="mb-3 border-bottom pb-2">Đơn hàng của bạn</h5>
                            
                            <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {cartItems.map(item => (
                                    <div key={item.id} className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <img src={item.image_url || 'https://via.placeholder.com/60'} alt={item.name} className="summary-item-img" />
                                            <div>
                                                <div className="fw-bold" style={{ fontSize: '0.9rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {item.name}
                                                </div>
                                                <small className="text-muted">SL: {item.quantity}</small>
                                            </div>
                                        </div>
                                        <div className="fw-bold text-danger">
                                            {Number(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr />
                            
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Tạm tính:</span>
                                <span>{Number(cartTotal).toLocaleString('vi-VN')} đ</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">Phí vận chuyển:</span>
                                <span>Miễn phí</span>
                            </div>
                            
                            <hr />
                            
                            <div className="d-flex justify-content-between mb-4">
                                <span className="fw-bold fs-5">Tổng cộng:</span>
                                <span className="fw-bold fs-5 text-danger">{Number(cartTotal).toLocaleString('vi-VN')} đ</span>
                            </div>

                            <Button 
                                variant="success" 
                                type="submit" 
                                size="lg" 
                                className="w-100 fw-bold" 
                                disabled={loading}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : 'Xác nhận đặt hàng'}
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default CheckoutPage;