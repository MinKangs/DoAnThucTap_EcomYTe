import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { BsList, BsChevronRight } from "react-icons/bs";
import { Link } from 'react-router-dom';
import api from '../services/api';
import './HomePage.css';

const HomePage = () => {
    // Tạm thời dùng dữ liệu mẫu. Sau này sẽ gọi API
    const categories = [
        "Hot Sale", "Thuốc", "Thực phẩm chức năng", 
        "Thiết bị, dụng cụ y tế", "Dược mỹ phẩm", 
        "Chăm sóc cá nhân", "Chăm sóc trẻ em"
    ];

    const [featuredProducts, setFeaturedProducts] = useState([]);

    useEffect(() => {
        // Gọi API lấy sản phẩm nổi bật (có thể là các sản phẩm mới nhất hoặc đang sale)
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                if (response.data.success) {
                    // Cắt lấy 4-8 sản phẩm để hiển thị mục quảng cáo
                    setFeaturedProducts(response.data.data.slice(0, 8)); 
                }
            } catch (error) {
                console.error("Lỗi lấy sản phẩm trang chủ", error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div style={{ backgroundColor: 'var(--light-bg)', minHeight: '100vh', paddingBottom: '40px' }}>
            
            <Container className="mt-4">
                <Row>
                    {/* Cột trái: Danh mục */}
                    <Col lg={3} className="d-none d-lg-block">
                        <div className="category-sidebar">
                            <h5 className="px-3 mb-3 pb-2 border-bottom d-flex align-items-center gap-2" style={{color: 'var(--primary-green)', fontWeight: 'bold'}}>
                                <BsList size={24} /> Danh mục
                            </h5>
                            <div className="custom-scrollbar" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {categories.map((cat, index) => (
                                    <Link 
                                        key={index} 
                                        to={`/category/${index}`} 
                                        className="category-item d-flex justify-content-between align-items-center"
                                    >
                                        <span>{cat}</span>
                                        <BsChevronRight className="text-secondary" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </Col>

                    {/* Cột phải: Banners và Sản phẩm nổi bật */}
                    <Col lg={9}>
                        {/* Section Banners */}
                        <Row className="mb-4 g-3">
                            <Col md={6}>
                                <div className="promo-banner">
                                    <img src="https://via.placeholder.com/600x250/ff6b6b/ffffff?text=Khuyen+Mai+1" alt="Banner 1" />
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="promo-banner">
                                    <img src="https://via.placeholder.com/600x250/4ecdc4/ffffff?text=Khuyen+Mai+2" alt="Banner 2" />
                                </div>
                            </Col>
                        </Row>

                        {/* Section Sản phẩm quảng cáo/nổi bật */}
                        <div className="bg-white p-3 p-md-4 rounded-4 shadow-sm">
                            <h4 className="section-title">🔥 Sản phẩm nổi bật / Quảng cáo</h4>
                            <Row className="g-3 mt-2">
                                {featuredProducts.length === 0 ? (
                                    <p className="text-center text-muted">Đang tải sản phẩm...</p>
                                ) : (
                                    featuredProducts.map(product => (
                                        <Col key={product.id} xs={6} md={4} xl={3}>
                                            <Card className="h-100 shadow-sm border-0 product-card">
                                                <Card.Img 
                                                    variant="top" 
                                                    src={product.image_url || 'https://via.placeholder.com/200x200?text=No+Image'} 
                                                    style={{ height: '180px', objectFit: 'contain', padding: '10px' }}
                                                />
                                                <Card.Body className="d-flex flex-column">
                                                    <Card.Title style={{ fontSize: '1rem', height: '40px', overflow: 'hidden' }}>
                                                        {product.name}
                                                    </Card.Title>
                                                    <Card.Text className="text-danger fw-bold fs-5 mb-3">
                                                        {parseInt(product.price).toLocaleString('vi-VN')} đ
                                                    </Card.Text>
                                                    <div className="mt-auto d-flex flex-column gap-2">
                                                        <Button as={Link} to={`/products/${product.id}`} variant="outline-success" size="sm">
                                                            Xem chi tiết
                                                        </Button>
                                                        <Button variant="success" size="sm">
                                                            Thêm vào giỏ
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))
                                )}
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default HomePage;