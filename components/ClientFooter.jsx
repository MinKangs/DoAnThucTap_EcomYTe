import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { BsShieldCheck, BsTruck, BsClockHistory, BsArrowRepeat } from "react-icons/bs";


const ClientFooter = () => {
    return (
        <footer className="client-footer mt-auto">
            {/* Phần 1: Cam kết & Minh họa */}
            <div className="footer-top-features">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={8}>
                            <Row className="g-4">
                                <Col md={6} className="d-flex align-items-center">
                                    <div className="feature-icon-wrapper"><BsShieldCheck /></div>
                                    <div>
                                        <div className="feature-title">CAM KẾT 100%</div>
                                        <p className="feature-desc">Thuốc chính hãng</p>
                                    </div>
                                </Col>
                                <Col md={6} className="d-flex align-items-center">
                                    <div className="feature-icon-wrapper"><BsTruck /></div>
                                    <div>
                                        <div className="feature-title">MIỄN PHÍ GIAO HÀNG</div>
                                        <p className="feature-desc">Đơn hàng từ 150.000đ</p>
                                    </div>
                                </Col>
                                <Col md={6} className="d-flex align-items-center">
                                    <div className="feature-icon-wrapper"><BsClockHistory /></div>
                                    <div>
                                        <div className="feature-title">GIAO NHANH 2 GIỜ</div>
                                        <p className="feature-desc text-success" style={{cursor: 'pointer'}}>Xem chi tiết</p>
                                    </div>
                                </Col>
                                <Col md={6} className="d-flex align-items-center">
                                    <div className="feature-icon-wrapper"><BsArrowRepeat /></div>
                                    <div>
                                        <div className="feature-title">ĐỔI TRẢ TRONG 30 NGÀY</div>
                                        <p className="feature-desc text-success" style={{cursor: 'pointer'}}>Xem chi tiết</p>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col lg={4} className="d-none d-lg-block text-center">
                            {/* Hình ảnh gia đình minh họa */}
                            <img 
                                src="" 
                                alt="Family Illustration" 
                                style={{ maxWidth: '100%', height: 'auto' }} 
                            />
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Phần 2: Mạng xã hội & Chứng nhận */}
            <div className="py-4">
                <Container>
                    <Row>
                        <Col md={6} className="mb-4 mb-md-0">
                            <h6 className="fw-bold mb-3 text-uppercase">Kết nối với chúng tôi</h6>
                            <div className="d-flex">
                                <img src="" alt="Zalo" className="social-icon" />
                                <img src="" alt="Facebook" className="social-icon" />
                                <img src="" alt="YouTube" className="social-icon" />
                            </div>
                        </Col>
                        <Col md={6}>
                            <h6 className="fw-bold mb-3 text-uppercase">Chứng nhận bởi</h6>
                            <div className="d-flex align-items-center">
                                {/* Dùng logo mẫu, có thể thay bằng link thật sau */}
                                <img src="" alt="Bộ Công Thương" className="cert-icon" />
                                <img src="" alt="DMCA Protected" className="cert-icon" />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </footer>
    );
};

export default ClientFooter;