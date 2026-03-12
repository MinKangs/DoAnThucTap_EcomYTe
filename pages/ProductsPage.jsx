import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './ProductsPage.css';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                if (response.data.success) {
                    setProducts(response.data.data);
                }
            } catch (err) {
                setError('Không thể tải danh sách sản phẩm từ máy chủ.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="info" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4 text-center products-title">Sản Phẩm Của Chúng Tôi</h2>
            <Row>
                {products.length === 0 ? (
                    <Col><p className="text-center">Hiện chưa có sản phẩm nào.</p></Col>
                ) : (
                    products.map(product => (
                        <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Img 
                                    variant="top" 
                                    src={product.image_url || 'https://via.placeholder.com/300x300?text=No+Image'} 
                                    className="product-img"
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title style={{ fontSize: '1.1rem' }}>{product.name}</Card.Title>
                                    <Card.Text className="product-price">
                                        {parseInt(product.price).toLocaleString('vi-VN')} đ
                                    </Card.Text>
                                    <div className="mt-auto d-flex flex-column gap-2">
                                        <Button as={Link} to={`/products/${product.id}`} variant="outline-info" size="sm">
                                            Xem chi tiết
                                        </Button>
                                        <Button size="sm" className="btn-add-cart">
                                            Thêm vào giỏ
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </Container>
    );
};

export default ProductsPage;