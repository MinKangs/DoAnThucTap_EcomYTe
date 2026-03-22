import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { BsCartPlus, BsShieldCheck } from 'react-icons/bs';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import './ProductDetailPage.css';

// Hàm xử lý đường dẫn ảnh bị thiếu domain backend
const backendUrl = 'http://localhost:5000';
const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x400?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${backendUrl}${url}`;
};

// Hàm định dạng mô tả: Xuống dòng và tự động in đậm các mục có dấu ":"
const formatDescription = (text) => {
    if (!text) return 'Chưa có thông tin mô tả chi tiết cho sản phẩm này. Vui lòng liên hệ dược sĩ để được tư vấn thêm.';
    
    // Tách văn bản thành các dòng bằng ký tự xuống dòng (\n)
    return text.split('\n').map((line, index) => {
        const colonIndex = line.indexOf(':');
        // Nếu có dấu ":" và nằm ở đầu câu (ví dụ: "Công dụng: abc...") thì in đậm
        if (colonIndex !== -1 && colonIndex < 30) { 
            const title = line.substring(0, colonIndex + 1);
            const content = line.substring(colonIndex + 1);
            return (
                <span key={index} className="d-block mb-2">
                    <strong className="text-dark">{title}</strong>{content}
                </span>
            );
        }
        // Nếu dòng thường thì chỉ cho xuống dòng
        return <span key={index} className="d-block mb-2">{line}</span>;
    });
};

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                if (response.data.success) {
                    setProduct(response.data.data);
                }
            } catch (err) {
                setError('Không thể tải thông tin sản phẩm. Sản phẩm có thể không tồn tại hoặc đã bị ẩn.');
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [id]);

    const handleQuantityChange = (type) => {
        if (type === 'decrease' && quantity > 1) {
            setQuantity(quantity - 1);
        } else if (type === 'increase') {
            setQuantity(quantity + 1);
        }
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
        alert(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng thành công!`);
    };

    if (loading) return <Container className="text-center py-5"><Spinner animation="border" variant="success" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!product) return null;

    return (
        <Container className="py-4">
            <div className="mb-3">
                <Link to="/" className="text-decoration-none text-muted">Trang chủ</Link>
                <span className="mx-2 text-muted">/</span>
                <Link to="/products" className="text-decoration-none text-muted">{product.category_name || 'Sản phẩm'}</Link>
                <span className="mx-2 text-muted">/</span>
                <span className="text-dark fw-bold">{product.name}</span>
            </div>

            <div className="product-detail-container">
                <Row>
                    <Col md={5} className="mb-4 mb-md-0">
                        <div className="product-image-wrapper">
                            {/* Đã bọc hàm getImageUrl tại đây */}
                            <img 
                                src={getImageUrl(product.image_url)} 
                                alt={product.name} 
                                className="product-main-image"
                            />
                        </div>
                    </Col>

                    <Col md={7}>
                        <h2 className="fw-bold mb-3">{product.name}</h2>
                        <div className="d-flex align-items-center mb-3">
                            <Badge bg="success" className="me-2">Hàng chính hãng</Badge>
                            <span className="text-muted">Nhà sản xuất: {product.manufacturer || 'Đang cập nhật'}</span>
                        </div>

                        <div className="price-box">
                            <h3 className="text-danger fw-bold m-0">
                                {Number(product.price).toLocaleString('vi-VN')} đ
                            </h3>
                        </div>

                        <div className="mb-4">
                            <h6 className="fw-bold">Mô tả sản phẩm:</h6>
                            <div className="text-muted" style={{ lineHeight: '1.6' }}>
                                {/* Đã bọc hàm formatDescription tại đây */}
                                {formatDescription(product.description)}
                            </div>
                        </div>

                        <hr />

                       {/* Kiểm tra tồn kho */}
                        {parseInt(product.total_stock) > 0 ? (
                            <div className="d-flex align-items-center gap-3 mt-4">
                                <div className="quantity-selector">
                                    <button className="quantity-btn" onClick={() => handleQuantityChange('decrease')}>-</button>
                                    <input type="text" className="quantity-input" value={quantity} readOnly />
                                    <button className="quantity-btn" onClick={() => handleQuantityChange('increase')}>+</button>
                                </div>
                                
                                <Button variant="success" size="lg" className="d-flex align-items-center px-4" onClick={handleAddToCart}>
                                    <BsCartPlus size={24} className="me-2" /> Thêm vào giỏ
                                </Button>
                            </div>
                        ) : (
                            <div className="mt-4 p-3 bg-light rounded text-center border">
                                <h5 className="text-danger fw-bold m-0">SẢN PHẨM HIỆN ĐANG HẾT HÀNG</h5>
                                <p className="text-muted small m-0 mt-1">Vui lòng quay lại sau hoặc liên hệ dược sĩ để được hỗ trợ.</p>
                            </div>
                        )}

                        <div className="mt-4 pt-3 border-top">
                            <p className="text-success mb-1 d-flex align-items-center">
                                <BsShieldCheck className="me-2" /> Đổi trả trong 30 ngày nếu có lỗi từ nhà sản xuất.
                            </p>
                        </div>
                    </Col>
                </Row>
            </div>
        </Container>
    );
};

export default ProductDetailPage;