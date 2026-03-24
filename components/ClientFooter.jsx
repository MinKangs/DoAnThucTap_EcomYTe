import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { BsShieldCheck, BsTruck, BsClockHistory, BsArrowRepeat } from "react-icons/bs";

// Import các icon từ thư mục assets
// (Đảm bảo tên file và đuôi file chính xác với những gì bạn đang có)
import fbIcon from '../assets/fb_icon.png';
import zaloIcon from '../assets/zalo_icon.webp';

const ClientFooter = () => {
    return (
        <footer className="client-footer mt-auto border-top">
            {/* Phần 1: Cam kết & Minh họa */}
            <div className="footer-top-features bg-light py-4">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={12}>
                            <Row className="g-4">
                                <Col md={3} sm={6} className="d-flex align-items-center justify-content-center justify-content-md-start">
                                    <div className="feature-icon-wrapper me-3 text-success"><BsShieldCheck size={32} /></div>
                                    <div>
                                        <div className="feature-title fw-bold">CAM KẾT 100%</div>
                                        <p className="feature-desc mb-0 text-muted small">Thuốc chính hãng</p>
                                    </div>
                                </Col>
                                <Col md={3} sm={6} className="d-flex align-items-center justify-content-center justify-content-md-start">
                                    <div className="feature-icon-wrapper me-3 text-success"><BsTruck size={32} /></div>
                                    <div>
                                        <div className="feature-title fw-bold">MIỄN PHÍ GIAO HÀNG</div>
                                        <p className="feature-desc mb-0 text-muted small">Đơn hàng từ 150.000đ</p>
                                    </div>
                                </Col>
                                <Col md={3} sm={6} className="d-flex align-items-center justify-content-center justify-content-md-start">
                                    <div className="feature-icon-wrapper me-3 text-success"><BsClockHistory size={32} /></div>
                                    <div>
                                        <div className="feature-title fw-bold">GIAO NHANH 2 GIỜ</div>
                                        <p className="feature-desc mb-0 text-success small" style={{cursor: 'pointer'}}>Xem chi tiết</p>
                                    </div>
                                </Col>
                                <Col md={3} sm={6} className="d-flex align-items-center justify-content-center justify-content-md-start">
                                    <div className="feature-icon-wrapper me-3 text-success"><BsArrowRepeat size={32} /></div>
                                    <div>
                                        <div className="feature-title fw-bold">ĐỔI TRẢ TRONG 30 NGÀY</div>
                                        <p className="feature-desc mb-0 text-success small" style={{cursor: 'pointer'}}>Xem chi tiết</p>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Phần 2: Mạng xã hội & Đăng ký nhận tin */}
            <div className="py-4 bg-white">
                <Container>
                    <Row>
                        <Col md={6} className="mb-4 mb-md-0 d-flex flex-column align-items-md-start align-items-center">
                            <h6 className="fw-bold mb-3 text-uppercase">Kết nối với chúng tôi</h6>
                            <div className="d-flex gap-3">
                                {/* Dùng ảnh từ assets. Nếu ảnh lỗi (chưa có), render thẻ div tạm */}
                                {zaloIcon ? <img src={zaloIcon} alt="Zalo" style={{ width: '32px', height: '32px', objectFit: 'cover' }} /> : <div className="bg-secondary rounded-circle" style={{ width: '32px', height: '32px' }}></div>}
                                {fbIcon ? <img src={fbIcon} alt="Facebook" style={{ width: '32px', height: '32px', objectFit: 'cover' }} /> : <div className="bg-secondary rounded-circle" style={{ width: '32px', height: '32px' }}></div>}
                            </div>
                        </Col>
                        
                        {/* Thay thế phần Chứng nhận bằng Form đăng ký */}
                        <Col md={6} className="d-flex flex-column align-items-md-end align-items-center">
                            <h6 className="fw-bold mb-3 text-uppercase">Đăng ký nhận tin khuyến mãi</h6>
                            <Form className="d-flex w-100" style={{ maxWidth: '400px' }}>
                                <Form.Control 
                                    type="email" 
                                    placeholder="Nhập email của bạn..." 
                                    className="rounded-start"
                                    style={{ borderRadius: '0' }}
                                />
                                <Button variant="success" className="rounded-end text-nowrap" style={{ borderRadius: '0' }}>
                                    Đăng ký
                                </Button>
                            </Form>
                            <small className="text-muted mt-2 text-center text-md-end">Nhận thông báo về các ưu đãi giảm giá sớm nhất.</small>
                        </Col>
                    </Row>
                </Container>
            </div>
            
            {/* Phần 3: Copyright */}
            <div className="text-center py-3 bg-dark text-light small">
                <Container>
                    &copy; {new Date().getFullYear()} MEDIC-SHOP. Bản quyền thuộc về Cửa hàng thuốc MEDIC-SHOP.
                </Container>
            </div>
        </footer>
    );
};

export default ClientFooter;