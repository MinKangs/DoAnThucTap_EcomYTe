import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsList, BsChevronRight, BsCartPlus } from "react-icons/bs";
import api from '../services/api';
import { useCart } from '../context/CartContext';
import banner1 from '../assets/banner1.webp';
import banner2 from '../assets/banner2.webp';
import './HomePage.css';

const backendUrl = 'http://localhost:5000';
const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/200?text=No+Image';
    if (url.startsWith('http')) return url;
    return `${backendUrl}${url}`;
};

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
                    // 1. Lọc ra các sản phẩm đang kinh doanh (active)
                    const activeProducts = productRes.data.data.filter(product => product.status === 'active');
                    
                    // 2. Cắt lấy 8 sản phẩm đầu tiên từ danh sách ĐÃ LỌC để đưa lên Trang chủ
                    setProducts(activeProducts.slice(0, 8));
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

            {/* KHU VỰC DANH MỤC VÀ BANNER NẰM NGANG */}
            <Row className="mb-5 g-4"> {/* g-4 tạo khoảng hở giữa cột danh mục và banner */}
                
                {/* Cột trái: Danh mục (Lấy từ CSDL) - Chiếm 3/12 phần */}
                <Col lg={3} md={4} className="d-none d-md-block">
                    <div className="category-sidebar bg-white rounded shadow-sm border h-100">
                        <h5 className="p-3 mb-0 border-bottom d-flex align-items-center gap-2" style={{color: 'var(--primary-green)', fontWeight: 'bold'}}>
                            <BsList size={24} /> Danh mục
                        </h5>
                        <div className="custom-scrollbar" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <Link 
                                        key={cat.id} 
                                        to={`/products?category=${cat.id}`} 
                                        className="category-item d-flex justify-content-between align-items-center p-3 border-bottom text-decoration-none text-dark"
                                    >
                                        <span>{cat.name}</span>
                                        <BsChevronRight className="text-secondary" size={12} />
                                    </Link>
                                ))
                            ) : (
                                <div className="p-3 text-muted text-center">Chưa có danh mục nào</div>
                            )}
                        </div>
                    </div>
                </Col>

                {/* Cột phải: Banner quảng cáo - Chiếm 9/12 phần còn lại */}
                <Col lg={9} md={8}>
                    <Carousel 
                        className="home-banner-slider h-100" 
                        interval={3000} // Thời gian chuyển slide: 3000ms = 3 giây
                        pause="hover"   // Tạm dừng chạy khi di chuột vào
                    >
                        <Carousel.Item className="h-100">
                            <img
                                className="d-block w-100 home-banner-img rounded shadow-sm"
                                src={banner1} 
                                alt="Banner khuyến mãi 1"
                                style={{ height: '100%', minHeight: '350px', objectFit: 'cover' }}
                            />
                        </Carousel.Item>
                        
                        <Carousel.Item className="h-100">
                            <img
                                className="d-block w-100 home-banner-img rounded shadow-sm"
                                src={banner2} 
                                alt="Banner khuyến mãi 2"
                                style={{ height: '100%', minHeight: '350px', objectFit: 'cover' }}
                            />
                        </Carousel.Item>
                    </Carousel>
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
                                                src={getImageUrl(product.image_url)} 
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
                                                
                                                {/* Kiểm tra tồn kho */}
                                                {parseInt(product.total_stock) > 0 ? (
                                                    <Button 
                                                        variant="outline-success" 
                                                        className="w-100 d-flex align-items-center justify-content-center gap-2 fw-medium"
                                                        onClick={(e) => handleAddToCart(product, e)}
                                                    >
                                                        <BsCartPlus size={18} /> Thêm vào giỏ
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        variant="secondary" 
                                                        className="w-100 d-flex align-items-center justify-content-center gap-2 fw-medium"
                                                        disabled
                                                        onClick={(e) => e.preventDefault()}
                                                    >
                                                        Tạm hết hàng
                                                    </Button>
                                                )}                                                
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