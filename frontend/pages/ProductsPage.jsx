import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import './ProductsPage.css';

const backendUrl = 'http://localhost:5000';
const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/200?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${backendUrl}${url}`;
};

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // Thêm state lưu danh mục
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchParams] = useSearchParams();
    const { addToCart } = useCart();

    const searchQuery = searchParams.get('search');
    const categoryQuery = searchParams.get('category');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Gọi song song 2 API: Lấy Sản phẩm và Lấy Danh mục
                const [prodRes, catRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories')
                ]);

                if (catRes.data.success) {
                    setCategories(catRes.data.data);
                }

                if (prodRes.data.success) {
                    let filteredProducts = prodRes.data.data.filter(p => p.status === 'active');

                    // Lọc theo từ khóa tìm kiếm
                    if (searchQuery) {
                        filteredProducts = filteredProducts.filter(p => 
                            p.name.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                    }

                    // Lọc theo danh mục
                    if (categoryQuery) {
                        filteredProducts = filteredProducts.filter(p => 
                            p.category_id && p.category_id.toString() === categoryQuery
                        );
                    }

                    setProducts(filteredProducts);
                }
            } catch (err) {
                setError('Không thể tải dữ liệu từ máy chủ.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [searchQuery, categoryQuery]); 

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    };

    // Logic xác định tiêu đề hiển thị động
    let pageTitle = 'Tất Cả Sản Phẩm';
    if (searchQuery) {
        pageTitle = `Kết quả tìm kiếm cho: "${searchQuery}"`;
    } else if (categoryQuery) {
        // Tìm tên danh mục dựa vào ID
        const foundCategory = categories.find(c => c.id.toString() === categoryQuery);
        pageTitle = foundCategory ? foundCategory.name : 'Sản Phẩm Theo Danh Mục';
    }

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="success" />
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
            {/* Tiêu đề đã được Format lại đẹp mắt */}
            <div className="d-flex justify-content-between align-items-end mb-4 pb-2 border-bottom border-success border-2">
                <h2 className="fw-bold text-success text-uppercase m-0">
                    {pageTitle}
                </h2>
                <span className="text-muted fw-medium pb-1">
                    Hiển thị <span className="text-dark fw-bold">{products.length}</span> sản phẩm
                </span>
            </div>
            
            <Row>
                {products.length === 0 ? (
                    <Col><p className="text-center py-5 text-muted">Hiện chưa có sản phẩm nào phù hợp với tìm kiếm của bạn.</p></Col>
                ) : (
                    products.map(product => (
                        <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                            <Card className="h-100 shadow-sm border-0 product-card-hover">
                                <Card.Img 
                                    variant="top" 
                                    src={getImageUrl(product.image_url)} 
                                    className="product-img p-3"
                                    style={{ objectFit: 'contain', height: '200px' }}
                                />
                                <Card.Body className="d-flex flex-column border-top">
                                    <Card.Title className="fw-bold text-dark" style={{ fontSize: '1.05rem', minHeight: '45px' }}>
                                        {product.name}
                                    </Card.Title>
                                    <Card.Text className="product-price text-danger fw-bold fs-5 mb-3">
                                        {Number(product.price).toLocaleString('vi-VN')} đ
                                    </Card.Text>
                                    
                                    <div className="mt-auto d-flex flex-column gap-2">
                                        <Button as={Link} to={`/products/${product.id}`} variant="outline-success" size="sm" className="fw-medium">
                                            Xem chi tiết
                                        </Button>
                                        
                                        {parseInt(product.total_stock) > 0 ? (
                                            <Button 
                                                size="sm" 
                                                variant="success"
                                                className="fw-medium shadow-sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleAddToCart(product);
                                                }}
                                            >
                                                Thêm vào giỏ
                                            </Button>
                                        ) : (
                                            <Button 
                                                size="sm" 
                                                variant="secondary"
                                                disabled
                                                onClick={(e) => e.preventDefault()}
                                            >
                                                Tạm hết hàng
                                            </Button>
                                        )}
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