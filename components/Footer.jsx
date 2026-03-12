import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-dark text-light py-4 mt-auto">
            <Container className="text-center">
                <p className="mb-0">&copy; 2026 Hệ Thống Y Tế. Bảo lưu mọi quyền.</p>
                <small className="text-muted">Đồ án thực tập - Phân hệ Thương mại điện tử</small>
            </Container>
        </footer>
    );
};

export default Footer;