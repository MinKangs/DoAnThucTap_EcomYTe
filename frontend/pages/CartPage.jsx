import React from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BsTrash } from 'react-icons/bs';
import { useCart } from '../context/CartContext';
import './CartPage.css';


const backendUrl = 'http://localhost:5000';
const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/200?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${backendUrl}${url}`;
};

const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
    const navigate = useNavigate();

    // Giao diện khi giỏ hàng trống
    if (cartItems.length === 0) {
        return (
            <Container className="py-5 text-center">
                <div className="cart-container py-5">
                    <div className="mb-4" style={{ fontSize: '4rem' }}>🛒</div>
                    <h4 className="mb-3">Giỏ hàng của bạn đang trống</h4>
                    <p className="text-muted mb-4">Hãy tìm kiếm và chọn thêm sản phẩm vào giỏ hàng nhé.</p>
                    <Button as={Link} to="/" variant="success" className="px-4 py-2">
                        Tiếp tục mua sắm
                    </Button>
                </div>
            </Container>
        );
    }

    // Giao diện khi có sản phẩm
    return (
        <Container className="py-4">
            <h4 className="mb-4 fw-bold">Giỏ hàng của bạn</h4>
            <Row>
                {/* Cột trái: Danh sách sản phẩm */}
                <Col lg={8} className="mb-4">
                    <div className="cart-container p-0 overflow-hidden">
                        <Table responsive className="align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4 py-3">Sản phẩm</th>
                                    <th className="text-center py-3">Đơn giá</th>
                                    <th className="text-center py-3">Số lượng</th>
                                    <th className="text-end py-3">Thành tiền</th>
                                    <th className="text-center py-3 px-4">Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <img 
                                                    src={getImageUrl(item.image_url)} 
                                                    alt={item.name} 
                                                    className="cart-item-img"
                                                />
                                                <div>
                                                    <Link to={`/products/${item.id}`} className="text-decoration-none text-dark fw-bold d-block mb-1">
                                                        {item.name}
                                                    </Link>
                                                    <small className="text-muted">Phân loại: Hộp</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center text-danger fw-bold">
                                            {Number(item.price).toLocaleString('vi-VN')} đ
                                        </td>
                                        <td className="text-center">
                                            <div className="cart-quantity-selector mx-auto">
                                                <button 
                                                    className="cart-quantity-btn" 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <input 
                                                    type="text" 
                                                    className="cart-quantity-input" 
                                                    value={item.quantity} 
                                                    readOnly 
                                                />
                                                <button 
                                                    className="cart-quantity-btn" 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="text-end text-danger fw-bold">
                                            {Number(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                        </td>
                                        <td className="text-center px-4">
                                            <Button variant="link" className="text-danger p-0" onClick={() => removeFromCart(item.id)}>
                                                <BsTrash size={20} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Col>

                {/* Cột phải: Tóm tắt đơn hàng */}
                <Col lg={4}>
                    <div className="cart-summary">
                        <h5 className="fw-bold mb-4">Tóm tắt đơn hàng</h5>
                        <div className="d-flex justify-content-between mb-3">
                            <span className="text-muted">Tạm tính:</span>
                            <span className="fw-bold">{Number(cartTotal).toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                            <span className="text-muted">Phí giao hàng:</span>
                            <span>Miễn phí</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between mb-4">
                            <span className="fw-bold fs-5">Tổng cộng:</span>
                            <span className="fw-bold fs-5 text-danger">{Number(cartTotal).toLocaleString('vi-VN')} đ</span>
                        </div>
                        <Button 
                            variant="success" 
                            size="lg" 
                            className="w-100 fw-bold"
                            onClick={() => navigate('/checkout')}
                        >
                            Tiến hành thanh toán
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default CartPage;