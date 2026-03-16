import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsList, BsChevronRight, BsCartPlus } from "react-icons/bs";
import api from '../services/api';
import { useCart } from '../context/CartContext';
import './HomePage.css';

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Lấy hàm thêm vào giỏ hàng từ Context
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                // Gọi song song 2 API để tăng tốc độ tải trang
                const [categoryRes, productRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/products')
                ]);

                if (categoryRes.data.success) {
                    setCategories(categoryRes.data.data);
                }

                if (productRes.data.success) {
                    // Cắt lấy 8 sản phẩm đầu tiên (mới nhất) để đưa lên Trang chủ
                    setProducts(productRes.data.data.slice(0, 8));
                }
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu trang chủ:', err);
                setError('Không thể tải dữ liệu. Vui lòng kiểm tra lại kết nối máy chủ.');
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    const handleAddToCart = (product, e) => {
        e.preventDefault(); // Ngăn chặn sự kiện click lan ra thẻ Link bọc ngoài Card
        addToCart(product, 1);
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="success" />
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="mb-5">
                {/* Cột trái: Danh mục (Lấy từ CSDL) */}
                <Col lg={3} className="d-none d-lg-block">
                    <div className="category-sidebar">
                        <h5 className="px-3 mb-3 pb-2 border-bottom d-flex align-items-center gap-2" style={{color: 'var(--primary-green)', fontWeight: 'bold'}}>
                            <BsList size={24} /> Danh mục
                        </h5>
                        <div className="custom-scrollbar" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <Link 
                                        key={cat.id} 
                                        to={`/products?category=${cat.id}`} 
                                        className="category-item d-flex justify-content-between align-items-center"
                                    >
                                        <span>{cat.name}</span>
                                        <BsChevronRight className="text-secondary" size={12} />
                                    </Link>
                                ))
                            ) : (
                                <div className="px-3 text-muted">Chưa có danh mục nào</div>
                            )}
                        </div>
                    </div>
                </Col>

                {/* Cột phải: Banner quảng cáo */}
                <Col lg={9}>
                    <Row className="g-2 mb-3">
                        <Col md={8}>
                            <img 
                                src="https://via.placeholder.com/800x400?text=Banner+Chinh" 
                                alt="Banner 1" 
                                className="img-fluid rounded shadow-sm w-100" 
                                style={{ objectFit: 'cover', height: '100%' }}
                            />
                        </Col>
                        <Col md={4} className="d-flex flex-column gap-2">
                            <img 
                                src="https://via.placeholder.com/400x195?text=Khuyen+Mai+1" 
                                alt="Banner 2" 
                                className="img-fluid rounded shadow-sm w-100" 
                            />
                            <img 
                                src="https://via.placeholder.com/400x195?text=Khuyen+Mai+2" 
                                alt="Banner 3" 
                                className="img-fluid rounded shadow-sm w-100" 
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* Phần Sản phẩm Nổi bật */}
            <div className="bg-white p-4 rounded shadow-sm border mb-4">
                <h4 className="fw-bold mb-4" style={{ color: '#d32f2f' }}>
                    🔥 SẢN PHẨM NỔI BẬT
                </h4>
                
                {products.length > 0 ? (
                    <Row className="g-4">
                        {products.map(product => (
                            <Col key={product.id} xs={6} md={4} lg={3}>
                                <Card className="h-100 product-card border-0 shadow-sm">
                                    <Link to={`/products/${product.id}`} className="text-decoration-none text-dark">
                                        <div className="p-3 text-center" style={{ height: '200px' }}>
                                            <Card.Img 
                                                variant="top" 
                                                src={product.image_url || 'https://via.placeholder.com/200'} 
                                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                            />
                                        </div>
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title className="fs-6 product-title" style={{ height: '40px', overflow: 'hidden' }}>
                                                {product.name}
                                            </Card.Title>
                                            <div className="mt-auto">
                                                <Card.Text className="text-danger fw-bold fs-5 mb-3">
                                                    {Number(product.price).toLocaleString('vi-VN')} đ
                                                </Card.Text>
                                                <Button 
                                                    variant="outline-success" 
                                                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                                                    onClick={(e) => handleAddToCart(product, e)}
                                                >
                                                    <BsCartPlus size={18} /> Thêm vào giỏ
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Link>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <div className="text-center text-muted py-5">
                        Chưa có sản phẩm nào trên hệ thống.
                    </div>
                )}
            </div>
        </Container>
    );
};

export default HomePage;